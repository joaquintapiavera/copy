import MongoEndPointTrack from "../../../src/infrastructure/mongo_schemas/endPointTrack.js";
import EndPointTrackRepository from "../../../src/infrastructure/repository/endPointTrackRepository.js";

jest.mock("../../../src/infrastructure/mongo_schemas/endPointTrack.js", () => ({
    create: jest.fn(),
    find: jest.fn()
}));

describe("EndPointTrackRepository", () => {
    let endPointTrackRepository;

    const trackData1 = {
        _id: "b29e5a9b-adc0-4cf5-9e98-439fc5dc3bba",
        endpointAccess: "/api/users/40b72c0a-c34f-4ee9-948f-b886eec9703b",
        requestMethod: "GET",
        statusCode: 200,
        responseTime: 120,
        timestamp: new Date("2026-02-13T10:00:00Z")
    };
    const trackObj1 = {toObject:() =>trackData1};

    const trackData2 = {
        _id: "2776ee30-1b6c-4bf8-b1b9-6383a0a0ce4f",
        endpointAccess: "/api/games",
        requestMethod: "POST",
        statusCode: 404,
        responseTime: 80,
        timestamp: new Date("2026-02-13T10:01:00Z")
    };
    const trackObj2 = {toObject: ()=>trackData2 };

    beforeEach(() => {
        endPointTrackRepository = new EndPointTrackRepository();
        jest.clearAllMocks();
    });

    describe("create tests", () => {
        test("creates an endpoint track for valid data", async () => {
            MongoEndPointTrack.create.mockResolvedValue(trackObj1);
            const result = await endPointTrackRepository.create(trackData1).run();
            expect(MongoEndPointTrack.create).toHaveBeenCalledWith(trackData1);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(trackData1);
        });

        test("returns error if track was not created", async () => {
            MongoEndPointTrack.create.mockResolvedValue(null);
            const result = await endPointTrackRepository.create(trackData1).run();
            expect(MongoEndPointTrack.create).toHaveBeenCalledWith(trackData1);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not created");
        });
    });

    describe("getAll tests", () => {
        test("returns all tracks", async () => {
            MongoEndPointTrack.find.mockResolvedValue([trackObj1, trackObj2]);
            const result = await endPointTrackRepository.getAll().run();
            expect(MongoEndPointTrack.find).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(expect.arrayContaining([trackData1, trackData2]));
        });

        test("returns right with empty array if find returns empty list", async () => {
            MongoEndPointTrack.find.mockResolvedValue([]);
            const result = await endPointTrackRepository.getAll().run();

            expect(MongoEndPointTrack.find).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual([]);
        });
    });
});