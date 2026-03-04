import { Either } from "../../../src/shared/monads/Either.js";
import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import MongoCard from "../../../src/infrastructure/mongo_schemas/card.js";
import CardRepository from "../../../src/infrastructure/repository/cardRepository.js";

jest.mock("../../../src/infrastructure/mongo_schemas/card.js", () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn()
}));


describe("CardRepository", () => {
    let cardRepository;
    const cardData = {
        _id: "123",
        color: "RED",
        value: 5,
        type: "NUMBER",
        gameId: "game123",
        createdAt: new Date()
    };
    const cardObject = {toObject: () => cardData };
    const cardData2 = { ...cardData, _id: "456", color: "BLUE" };
    const cardObject2 = { toObject: () => cardData2 };

    beforeEach(() => {
        cardRepository = new CardRepository();
        jest.clearAllMocks();
    });

    describe("create tests", () => {
        test("creates a card for valid data", async() => {
            MongoCard.create.mockResolvedValue(cardObject);
            const result = await cardRepository.create(cardData).run();
            expect(MongoCard.create).toHaveBeenCalledWith(cardData);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(cardData);
        });

        test("returns error if card was not created", async ()=> {
            MongoCard.create.mockResolvedValue(null);
            const result = await cardRepository.create(cardData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not created");
        });
    });

    describe("getById tests", () => {
        const id = "123";
        test("returns found card for valid id", async () => {
            MongoCard.findById.mockResolvedValue(cardObject);
            const result = await cardRepository.getById(id).run();
            expect(MongoCard.findById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(cardData);
        });
        test("returns error if card is not found", async () => {
            MongoCard.findById.mockResolvedValue(null);
            const result = await cardRepository.getById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not Found");
        });
    });

    describe("updateById tests", () => {
        const id = "123";
        const updateData = {
            color: "BLUE"
        };
        test("returns the correct updated card data", async () => {
            MongoCard.findByIdAndUpdate.mockResolvedValue(cardObject);
            const updateFunc = cardRepository.updateById(id);
            const result = await updateFunc(updateData).run();

            expect(MongoCard.findByIdAndUpdate).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(cardData);
        });

        test("returns error if cardt to update is not found", async () => {
            MongoCard.findByIdAndUpdate.mockResolvedValue(null);
            const updateFunc = cardRepository.updateById(id);
            const result = await updateFunc(updateData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });

    });

    describe("deleteById funciton", () => {
        const id = "123";
        test("returns the deleted object if it was deleted", async () => {
            MongoCard.findByIdAndDelete.mockResolvedValue(cardObject);
            const result = await cardRepository.deleteById(id).run();
            expect(MongoCard.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(cardData);
        });

        test("returns error if card was not deleted", async () => {
            MongoCard.findByIdAndDelete.mockResolvedValue(null);
            const result = await cardRepository.deleteById(id).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });
    describe("createMultiple tests", () => {
        const cardsArray = [cardData, cardData2];
        const cardObjects = [cardObject, cardObject2];

        test("creates multiple cards successfully", async () => {
            MongoCard.create.mockResolvedValueOnce(cardObject).mockResolvedValueOnce(cardObject2);
            const result = await cardRepository.createMultiple(cardsArray).run();
            expect(MongoCard.create).toHaveBeenCalledTimes(2);
            expect(MongoCard.create).toHaveBeenCalledWith(cardData);
            expect(MongoCard.create).toHaveBeenCalledWith(cardData2);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual([cardData, cardData2]);
        });

        test("returns error if any card creation fails", async () => {
            MongoCard.create.mockResolvedValueOnce(cardObject).mockResolvedValueOnce(null);
            const result = await cardRepository.createMultiple(cardsArray).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Creation failed");
        });
    });

    describe("getByIds tests", () => {
        const ids = ["123", "456"];
        test("returns empty array if no cards found", async () => {
            MongoCard.find.mockResolvedValue([]);
            const result = await cardRepository.getByIds(ids).run();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual([]);
        });
    })
});