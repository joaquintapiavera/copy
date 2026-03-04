import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import { Either } from "../../../src/shared/monads/Either.js";
import * as helpers from "../../../src/domain/helpers/helpers.js";
import {getRequestsStatsService,getResponseTimesService, getStatusCodesService, getPopularEndpointsService } from "../../../src/application/services/endPointTrackService.js";

afterEach(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.resetModules();
});

describe("request stats services tests", () => {
    describe("getRequestsStatsService", () => {
        test("calculates the stats foreach url successfully", async () => {
            const uuid = "7730bc29-c0f2-487b-b6f7-0dc180199a0e";
            const uuid2 = "e34ed837-53fc-4030-ab90-54af5d682ac9";
            const tracks = [
                {endpointAccess: `/api/users/${uuid}`, requestMethod: "GET", statusCode: 200, responseTime: 120},
                {endpointAccess: `/api/games/${uuid2}`, requestMethod: "PUT", statusCode: 404, responseTime: 80}
            ];
            const expectedStats = {
                total_requests: 2,
                breakdown: {
                    "/api/users/:id":{
                        "GET": 1
                    }, 
                    "/api/games/:id":{
                        "PUT": 1
                    } 
                }
            };
            const endPointTrackRepository = {getAll: jest.fn()};
            endPointTrackRepository.getAll.mockReturnValue(AsyncEither.of(tracks));
            jest.spyOn(helpers, "calculateRequestStats").mockReturnValue(expectedStats);
            const service = getRequestsStatsService(endPointTrackRepository);
            const result = await service().run();
            expect(endPointTrackRepository.getAll).toHaveBeenCalled();
            expect(helpers.calculateRequestStats).toHaveBeenCalledWith(tracks);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(expectedStats);
        });

        test("returns error if the retrieve of tracks fail", async () => {
            const endPointTrackRepository = {getAll: jest.fn()};
            endPointTrackRepository.getAll.mockReturnValue(AsyncEither.fromEither(Either.left("Not found")));

            jest.spyOn(helpers, "calculateRequestStats");
            const service = getRequestsStatsService(endPointTrackRepository);
            const result = await service().run();
            expect(endPointTrackRepository.getAll).toHaveBeenCalled();
            expect(helpers.calculateRequestStats).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("getResponseTimesService", () => {
        test("calculates response times correctly", async () => {
            const uuid = "7730bc29-c0f2-487b-b6f7-0dc180199a0e";
            const tracks = [
                { endpointAccess: `/api/users/${uuid}`, responseTime: 120 },
                { endpointAccess: `/api/users/${uuid}`, responseTime: 80 }
            ];
            const expected = {
                "/api/users/:id":{
                    avg: 100,
                    min: 80,
                    max: 120
                }
            };
            const endPointTrackRepository = { getAll: jest.fn() };
            endPointTrackRepository.getAll.mockReturnValue(AsyncEither.of(tracks));
            jest.spyOn(helpers, "calculateResponseTimes").mockReturnValue(expected);
            const service = getResponseTimesService(endPointTrackRepository);
            const result = await service().run();
            expect(endPointTrackRepository.getAll).toHaveBeenCalled();
            expect(helpers.calculateResponseTimes).toHaveBeenCalledWith(tracks);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(expected);
        });
    });

    describe("getStatusCodesService", () => {
        test("calculates status codes correctly", async () => {
            const tracks = [
                {statusCode: 200},
                {statusCode: 404},
                {statusCode: 200}
            ];
            const expected = {"200": 2, "404": 1};

            const endPointTrackRepository = { getAll: jest.fn() };
            endPointTrackRepository.getAll.mockReturnValue(AsyncEither.of(tracks));
            jest.spyOn(helpers, "calculateStatusCodes").mockReturnValue(expected);
            const service = getStatusCodesService(endPointTrackRepository);
            const result = await service().run();
            expect(endPointTrackRepository.getAll).toHaveBeenCalled();
            expect(helpers.calculateStatusCodes).toHaveBeenCalledWith(tracks);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(expected);
        });
    });

    describe("getPopularEndpointsService", () => {
        test("calculates most popular endpoints correctly", async () => {
            const uuid = "7730bc29-c0f2-487b-b6f7-0dc180199a0e";
            const uuid2 = "e34ed837-53fc-4030-ab90-54af5d682ac9";
            const tracks = [
                { endpointAccess: `/api/users/${uuid}` },
                { endpointAccess: `/api/users/${uuid}` },
                { endpointAccess: `/api/users/${uuid2}` }
            ];
            const expected = {most_popular: "/api/users/:id", request_count: 2 };

            const endPointTrackRepository = { getAll: jest.fn() };
            endPointTrackRepository.getAll.mockReturnValue(AsyncEither.of(tracks));
            jest.spyOn(helpers, "calculateMostPopularEndpoint").mockReturnValue(expected);
            const service = getPopularEndpointsService(endPointTrackRepository);
            const result = await service().run();

            expect(endPointTrackRepository.getAll).toHaveBeenCalled();
            expect(helpers.calculateMostPopularEndpoint).toHaveBeenCalledWith(tracks);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(expected);
        });
    });
});