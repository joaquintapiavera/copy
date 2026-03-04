import MongoScore from "../../../src/infrastructure/mongo_schemas/score";
import ScoreRepository from "../../../src/infrastructure/repository/scoreRepository";


jest.mock("../../../src/infrastructure/mongo_schemas/score.js", () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn()
}));

describe("ScoreRepository", () => {
    let scoreRepository;
    const scoreData = {
        _id: "123",
        playerId: "player123",
        gameId: "game123",
        value: 100,
        createdAt: new Date()
    };
    const scoreObject = { toObject: () => scoreData };

    beforeEach(() => {
        scoreRepository = new ScoreRepository();
        jest.clearAllMocks();
    });

    describe("create tests", () => {
        test("returns the created score for valid data", async () => {
            MongoScore.create.mockResolvedValue(scoreObject);
            const result = await scoreRepository.create(scoreData).run();
            expect(MongoScore.create).toHaveBeenCalledWith(scoreData);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(scoreData);
        });

        test("returns error if card was not created", async () => {
            MongoScore.create.mockResolvedValue(null);
            const result = await scoreRepository.create(scoreData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not created");
        });
    });

    describe("getById tests", () => {
        const id = "123";

        test("returns the obtained score for valid id", async () => {
            MongoScore.findById.mockResolvedValue(scoreObject);

            const result = await scoreRepository.getById(id).run();

            expect(MongoScore.findById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(scoreData);
        });

        test("returns error if score was not found", async () => {
            MongoScore.findById.mockResolvedValue(null);
            const result = await scoreRepository.getById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not Found");
        });
    });

    describe("updateById tests", () => {
        const id = "123";
        const updateData = { value: 200 };
        test("returns the updated score for valid update data and id", async () => {
            MongoScore.findByIdAndUpdate.mockResolvedValue(scoreObject);
            const updateFunc = scoreRepository.updateById(id);
            const result = await updateFunc(updateData).run();
            expect(MongoScore.findByIdAndUpdate).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(scoreData);
        });

        test("returns error if score was not found", async () => {
            MongoScore.findByIdAndUpdate.mockResolvedValue(null);
            const updateFunc = scoreRepository.updateById(id);
            const result = await updateFunc(updateData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("deleteById", () => {
        const id = "123";
        test("returns the deleted score for valid id", async () => {
            MongoScore.findByIdAndDelete.mockResolvedValue(scoreObject);

            const result = await scoreRepository.deleteById(id).run();

            expect(MongoScore.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(scoreData);
        });

        test("returns error if the score was not found", async () => {
            MongoScore.findByIdAndDelete.mockResolvedValue(null);

            const result = await scoreRepository.deleteById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });
    describe("createMultiple", () => {
        const scoresArray = [
            { ...scoreData, _id: "1" },
            { ...scoreData, _id: "2" }
        ];
        const scoreObjects = scoresArray.map(s => ({ toObject: () => s }));
        test("creates multiple scores successfully", async () => {
            MongoScore.create.mockResolvedValueOnce(scoreObjects[0])
                          .mockResolvedValueOnce(scoreObjects[1]);
            const result = await scoreRepository.createMultiple(scoresArray).run();
            expect(MongoScore.create).toHaveBeenCalledTimes(2);
            expect(MongoScore.create).toHaveBeenCalledWith(scoresArray[0]);
            expect(MongoScore.create).toHaveBeenCalledWith(scoresArray[1]);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(scoresArray);
        });

        test("returns error if any creation fails", async () => {
            MongoScore.create.mockResolvedValueOnce(scoreObjects[0])
                          .mockResolvedValueOnce(null);
            const result = await scoreRepository.createMultiple(scoresArray).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Creation failed");
        });
    });

    describe("getByGameId", () => {
        const gameId = "game123";
        const scoresArray = [
            {...scoreData, _id: "1" },
            {...scoreData, _id: "2" }
        ];
        const scoreDocs = scoresArray.map(s => ({ toObject: () => s }));

        test("returns scores for given gameId", async () => {
            MongoScore.find.mockResolvedValue(scoreDocs);
            const result = await scoreRepository.getByGameId(gameId).run();
            expect(MongoScore.find).toHaveBeenCalledWith({ gameId });
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(scoresArray);
        });

        test("returns empty array if no scores found", async () => {
            MongoScore.find.mockResolvedValue([]);
            const result = await scoreRepository.getByGameId(gameId).run();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual([]);
        });

        test("returns left if database error occurs", async () => {
            const error = new Error("Database error");
            MongoScore.find.mockRejectedValue(error);
            const result = await scoreRepository.getByGameId(gameId).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Database error");
        });
    });
});