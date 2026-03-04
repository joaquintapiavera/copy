import MongoSession from "../../../src/infrastructure/mongo_schemas/session";
import SessionRepository from "../../../src/infrastructure/repository/sessionRepository";

jest.mock("../../../src/infrastructure/mongo_schemas/session.js", () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
}));

describe("SessionRepository", () => {
    let sessionRepository;
    const sessionData = {
        _id: "123",
        token: "validToken",
        userId: "user123",
        revoked: false,
        createdAt: new Date()
    };
    const sessionObject = { toObject: () => sessionData };

    beforeEach(() => {
        sessionRepository = new SessionRepository();
        jest.clearAllMocks();
    });

    describe("create tests", () => {
        test("returns the created session for valid data", async () => {
            MongoSession.create.mockResolvedValue(sessionObject);
            const result = await sessionRepository.create(sessionData).run();

            expect(MongoSession.create).toHaveBeenCalledWith(sessionData);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(sessionData);
        });

        test("returns error if the session was not created", async () => {
            MongoSession.create.mockResolvedValue(null);
            const result = await sessionRepository.create(sessionData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not created");
        });
    });

    describe("getById tests", () => {
        const id = "123";

        test("returns the obtained session for valid id", async () => {
            MongoSession.findById.mockResolvedValue(sessionObject);
            const result = await sessionRepository.getById(id).run();

            expect(MongoSession.findById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(sessionData);
        });

        test("returns error if session was not found", async () => {
            MongoSession.findById.mockResolvedValue(null);
            const result = await sessionRepository.getById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not Found");
        });
    });

    describe("updateById tests", () => {
        const id = "123";
        const updateData = { revoked: true };

        test("returns the updated session for valid data and id", async () => {
            MongoSession.findByIdAndUpdate.mockResolvedValue(sessionObject);
            const updateFunc = sessionRepository.updateById(id);
            const result = await updateFunc(updateData).run();

            expect(MongoSession.findByIdAndUpdate).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(sessionData);
        });

        test("returns error if session was not found", async () => {
            MongoSession.findByIdAndUpdate.mockResolvedValue(null);

            const updateFunc = sessionRepository.updateById(id);
            const result = await updateFunc(updateData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });

    });

    describe("deleteById tests", () => {
        const id = "123";
        test("returns the deleted session for valid id", async () => {
            MongoSession.findByIdAndDelete.mockResolvedValue(sessionObject);
            const result = await sessionRepository.deleteById(id).run();
            expect(MongoSession.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(sessionData);
        });

        test("returns error if session was not Found", async () => {
            MongoSession.findByIdAndDelete.mockResolvedValue(null);
            const result = await sessionRepository.deleteById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("getByToken tests", () => {
        const token = "validToken";
        test("returns session for valid token", async () => {
            MongoSession.findOne.mockResolvedValue(sessionObject);
            const result = await sessionRepository.getByToken(token).run();
            expect(MongoSession.findOne).toHaveBeenCalledWith({ token });
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(sessionData);
        });

        test("returns error if session was not found", async () => {
            MongoSession.findOne.mockResolvedValue(null);
            const result = await sessionRepository.getByToken(token).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not Found");
        });

    });

    describe("updateByToken tests", () => {
        const token = "validToken";
        const updateData = { revoked: true };
        test("returns the updated session for valid data and token", async () => {
            MongoSession.findOneAndUpdate.mockResolvedValue(sessionObject);
            const updateFunc = sessionRepository.updateByToken(token);
            const result = await updateFunc(updateData).run();
            expect(MongoSession.findOneAndUpdate).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(sessionData);
        });

        test("returns error if session was not found", async () => {
            MongoSession.findOneAndUpdate.mockResolvedValue(null);
            const updateFunc = sessionRepository.updateByToken(token);
            const result = await updateFunc(updateData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });
});