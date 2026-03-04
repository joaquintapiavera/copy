import { createScoreController, getScoreByIdController, updateScoreByIdController, partiallyUpdateScoreByIdController, deleteScoreByIdController } from "../../../../src/infrastructure/http/controllers/scoreController";
import { Either } from "../../../../src/shared/monads/Either";


afterEach(() => {
    jest.restoreAllMocks();
});

describe("score controller tests", () => {
    let request, response, next;
    beforeEach(() => {
        request = {
            body: {},
            params: {}
        };
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    describe("createScoreController tests", () => {
        let createScoreService;
        beforeEach(() => {
            createScoreService = jest.fn();
            request.body = {
                playerId: "789",
                gameId: "456",
                value: 100
            };
        });

        test("creates score successfully", async () => {
            const score = {
                _id: "123",
                playerId: "789",
                gameId: "456",
                value: 100,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };
            createScoreService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(score))
            });

            const controller = createScoreController(createScoreService);
            await controller(request, response, next);

            expect(createScoreService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith(score);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns error", async () => {
            const error = "ID required";
            createScoreService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = createScoreController(createScoreService);
            await controller(request, response, next);
            expect(createScoreService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next when service throws an error", async () => {
            const error = new Error("Database error");
            createScoreService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = createScoreController(createScoreService);
            await controller(request, response, next);
            expect(createScoreService).toHaveBeenCalledWith(request.body);
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getScoreByIdController tests", () => {
        let getScoreByIdService;

        beforeEach(() => {
            getScoreByIdService = jest.fn();
            request.params = { id: "123" };
        });

        test("returns score successfully", async () => {
            const score = {
                _id: "123",
                playerId: "789",
                gameId: "456",
                value: 100,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };
            getScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(score))
            });

            const controller = getScoreByIdController(getScoreByIdService);
            await controller(request, response, next);
            expect(getScoreByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(score);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when score not found", async () => {
            const error = "Not found";
            getScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getScoreByIdController(getScoreByIdService);
            await controller(request, response, next);

            expect(getScoreByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getScoreByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getScoreByIdController(getScoreByIdService);
            await controller(request, response, next);

            expect(getScoreByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("updateScoreByIdController tests", () => {
        let updateScoreByIdService;

        beforeEach(() => {
            updateScoreByIdService = jest.fn();
            request.params = { id: "123" };
            request.body = {
                playerId: "789",
                gameId: "456",
                value: 200
            };
        });

        test("updates score successfully", async () => {
            const updatedScore = {
                _id: "123",
                playerId: "789",
                gameId: "456",
                value: 200,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            updateScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedScore))
            });

            const controller = updateScoreByIdController(updateScoreByIdService);
            await controller(request, response, next);

            expect(updateScoreByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedScore);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when score not found", async () => {
            const error = "Not found";
            updateScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = updateScoreByIdController(updateScoreByIdService);
            await controller(request, response, next);

            expect(updateScoreByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            updateScoreByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = updateScoreByIdController(updateScoreByIdService);
            await controller(request, response, next);

            expect(updateScoreByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("partiallyUpdateScoreByIdController tests ", () => {
        let partiallyUpdateScoreByIdService;

        beforeEach(() => {
            partiallyUpdateScoreByIdService = jest.fn();
            request.params = { id: "123" };
            request.body = {
                value: 300
            };
        });

        test("partially updates score successfully", async () => {
            const updatedScore = {
                _id: "123",
                playerId: "789",
                gameId: "456",
                value: 300,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            partiallyUpdateScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedScore))
            });

            const controller = partiallyUpdateScoreByIdController(partiallyUpdateScoreByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateScoreByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedScore);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when score not found", async () => {
            const error = "Not found";
            partiallyUpdateScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = partiallyUpdateScoreByIdController(partiallyUpdateScoreByIdService);
            await controller(request, response, next);
            expect(partiallyUpdateScoreByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            partiallyUpdateScoreByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = partiallyUpdateScoreByIdController(partiallyUpdateScoreByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateScoreByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("deleteScoreByIdController tets", () => {
        let deleteScoreByIdService;

        beforeEach(() => {
            deleteScoreByIdService = jest.fn();
            request.params = { id: "123" };
        });

        test("deletes score successfully", async () => {
            const deletedScore = {
                _id: "123",
                playerId: "789",
                gameId: "456",
                value: 100,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            deleteScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(deletedScore))
            });

            const controller = deleteScoreByIdController(deleteScoreByIdService);
            await controller(request, response, next);

            expect(deleteScoreByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(204);
            expect(response.send).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when score not found", async () => {
            const error = "Not found";
            deleteScoreByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = deleteScoreByIdController(deleteScoreByIdService);
            await controller(request, response, next);

            expect(deleteScoreByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            deleteScoreByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = deleteScoreByIdController(deleteScoreByIdService);
            await controller(request, response, next);

            expect(deleteScoreByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.send).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });
});