import MongoGame from "../../../src/infrastructure/mongo_schemas/game";
import GameRepository from "../../../src/infrastructure/repository/gameRepository";

jest.mock("../../../src/infrastructure/mongo_schemas/game", () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

describe("GameRepository", () => {
    let gameRepository;
    const gameData = {
        _id: "123",
        name: "Test Game",
        maxPlayers: 4,
        status: "waiting",
        playersIds: [],
        turnIndex: 0,
        deck: [],
        discardPile: [],
        winnerId: null,
        createdAt: new Date()
    };
    const gameObject = { toObject: () => gameData };

    beforeEach(() => {
        gameRepository = new GameRepository();
        jest.clearAllMocks();
    });

    describe("create tests", () => {
        test("returns the created game for valid data", async () => {
            MongoGame.create.mockResolvedValue(gameObject);
            const result = await gameRepository.create(gameData).run();
            expect(MongoGame.create).toHaveBeenCalledWith(gameData);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(gameData);
        });

        test("retuns error if game was not created", async () => {
            MongoGame.create.mockResolvedValue(null);
            const result = await gameRepository.create(gameData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not created");
        });
    });

    describe("getById tests", () => {
        const id = "123";
        test("returns the obtained game for valid id", async () => {
            MongoGame.findById.mockResolvedValue(gameObject);
            const result = await gameRepository.getById(id).run();
            expect(MongoGame.findById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(gameData);
        });

        test("returns eror if game was not found", async () => {
            MongoGame.findById.mockResolvedValue(null);
            const result = await gameRepository.getById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not Found");
        });
    }); 

    describe("updateById tests", () => {
        const id = "123";
        const updateData = { name: "Updated Game" };
        test("returns updated game for valid data and id", async () => {
            MongoGame.findByIdAndUpdate.mockResolvedValue(gameObject);
            const updateFunc = gameRepository.updateById(id);
            const result = await updateFunc(updateData).run();
            expect(MongoGame.findByIdAndUpdate).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(gameData);
        });

        test("returns error if game was not found", async () => {
            MongoGame.findByIdAndUpdate.mockResolvedValue(null);
            const updateFunc = gameRepository.updateById(id);
            const result = await updateFunc(updateData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("deleteById tests", () => {
        const id = "123";
        test("returns the deleted game fro valid id", async () => {
            MongoGame.findByIdAndDelete.mockResolvedValue(gameObject);
            const result = await gameRepository.deleteById(id).run();
            expect(MongoGame.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(gameData);
        });

        test("returns error if game was not found", async () => {
            MongoGame.findByIdAndDelete.mockResolvedValue(null);
            const result = await gameRepository.deleteById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });
});