import { getRequestsStatsController,getResponseTimesController,getStatusCodesController,getPopularEndpointsController } from "../../../../src/infrastructure/http/controllers/endPointTrackController";
import { Either } from "../../../../src/shared/monads/Either";

afterEach(() => {
    jest.restoreAllMocks();
});

describe("request stats controllers tests", () => {
    let request, response, next;

    beforeEach(() => {
        request = {
            body: {},
            params: {}
        };
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe("getRequestsStatsController", () => {
        let getRequestsStatsService;

        beforeEach(() => {
            getRequestsStatsService = jest.fn();
        });

        test("returns stats successfully", async () => {
            const stats = {
                total_requests: 2,
                breakdown: {
                    "/api/users/:id":{
                        GET: 1
                    }
                }
            };
            getRequestsStatsService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(stats))
            });

            const controller = getRequestsStatsController(getRequestsStatsService);
            await controller(request, response, next);

            expect(getRequestsStatsService).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(stats);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = { message: "No data" };

            getRequestsStatsService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getRequestsStatsController(getRequestsStatsService);
            await controller(request, response, next);
            expect(getRequestsStatsService).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith(error);
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next when service throws an error", async () => {
            const error = new Error("DB error");
            getRequestsStatsService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getRequestsStatsController(getRequestsStatsService);
            await controller(request, response, next);

            expect(getRequestsStatsService).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getResponseTimesController tests", () => {
        let getResponseTimesService;

        beforeEach(() => {
            getResponseTimesService = jest.fn();
        });

        test("returns response times successfully", async () => {
            const times = {
                "/api/users/:id":{
                    avg: 100,
                    min: 80,
                    max: 120
                }
            };
            getResponseTimesService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(times))
            });

            const controller = getResponseTimesController(getResponseTimesService);
            await controller(request, response, next);
            expect(getResponseTimesService).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(times);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = { message: "No tracks" };

            getResponseTimesService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });
            const controller = getResponseTimesController(getResponseTimesService);
            await controller(request, response, next);

            expect(getResponseTimesService).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith(error);
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next when service throws", async () => {
            const error = new Error("Unexpected");
            getResponseTimesService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });
            const controller = getResponseTimesController(getResponseTimesService);
            await controller(request, response, next);
            expect(getResponseTimesService).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getStatusCodesController tests", () => {
        let getStatusCodesService;

        beforeEach(() => {
            getStatusCodesService = jest.fn();
        });

        test("returns status codes successfully", async () => {
            const codes = { "200": 5, "404": 2 };

            getStatusCodesService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(codes))
            });
            const controller = getStatusCodesController(getStatusCodesService);
            await controller(request, response, next);
            expect(getStatusCodesService).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(codes);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = { message: "Unexpected" };

            getStatusCodesService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });
            const controller = getStatusCodesController(getStatusCodesService);
            await controller(request, response, next);
            expect(getStatusCodesService).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith(error);
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getStatusCodesService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getStatusCodesController(getStatusCodesService);
            await controller(request, response, next);
            expect(getStatusCodesService).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getPopularEndpointsController tests", () => {
        let getPopularEndpointsService;

        beforeEach(() => {
            getPopularEndpointsService = jest.fn();
        });

        test("returns popular endpoints successfully", async () => {
            const popular = { most_popular: "/api/users/:id", request_count: 10 };

            getPopularEndpointsService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(popular))
            });

            const controller = getPopularEndpointsController(getPopularEndpointsService);
            await controller(request, response, next);
            expect(getPopularEndpointsService).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(popular);
            expect(next).not.toHaveBeenCalled();
        });
    });
});