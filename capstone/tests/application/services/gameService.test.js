import { createGameService, getGameByIdService, updateGameByIdService, partiallyUpdateGameByIdService, deleteGameByIdService, joinGameService, startGameService, leaveGameService, endGameService, getPlayersNamesService, getCurrentPlayerService, getTopCardService, getAllScoresService, getGamePlayers, dealCardsService, getPlayersHandsService, getPlayerHandService, getHandByUsernameService, playCardService, getGameByUserIdService, drawCardService, drawMultipleCardsService, sayUnoService, challengePlayerService, handlePlayCardService, handleDrawCardService, findWinnerService, getGameStateService, getGameHistoryService } from "../../../src/application/services/gameService.js";
import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import * as schemaValidators from "../../../src/domain/validators/schemaValidators.js";
import * as sharedValidators from "../../../src/domain/validators/sharedValidators.js";
import * as helpers from "../../../src/domain/helpers/helpers.js";
import { Either } from "../../../src/shared/monads/Either.js";
import { createCardService, getCardByIdService } from "../../../src/application/services/cardService.js";
import { getUserByIdService, getUserByUsernameService, updateUserByIdService } from "../../../src/application/services/userService.js";

jest.mock("../../../src/application/services/cardService.js");
jest.mock("../../../src/application/services/userService.js");

afterEach(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});

describe("game service tests", () => {
    describe("create game tests", () => {
        test("creates game with valid data", async () => {
            const data = {
                name: "Test Game",
                rules: "Standard",
                userId: "789"
            };
            const createdCard = {
                _id: "456",
                color: "RED",
                value: 5,
                type: "NUMBER"
            };
            const savedGame = {
                _id: "123",
                name: "Test Game",
                rules: "Standard",
                status: "WAITING",
                maxPlayers: 4,
                creatorId: "789",
                playersIds: ["789"],
                turnIndex: 0,
                deck: [],
                topCard: "456",
                history: [],
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const gameRepository = {
                create: jest.fn().mockReturnValue(AsyncEither.of(savedGame))
            };
            const cardRepository = {};

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(helpers, "updateField");
            jest.spyOn(schemaValidators, "toResponse");
            jest.spyOn(helpers, "createRandomCard").mockReturnValue({
                color: "RED",
                value: 5,
                type: "NUMBER"
            });

            const createCard = jest.fn().mockReturnValue(AsyncEither.of(createdCard));
            createCardService.mockReturnValue(createCard);

            const service = createGameService(gameRepository, cardRepository);
            const result = await service(data).run();

            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(helpers.updateField).toHaveBeenCalled();
            expect(createCardService).toHaveBeenCalledWith(cardRepository);
            expect(createCard).toHaveBeenCalled();
            expect(gameRepository.create).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(savedGame._id);
            expect(result.value.topCard).toBe(createdCard._id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not create game if there is no data", async () => {
            const data = {};
            const gameRepository = { create: jest.fn() };
            const cardRepository = {};

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = createGameService(gameRepository, cardRepository);
            const result = await service(data).run();

            expect(gameRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('name is required');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not create game if required fields are incomplete", async () => {
            const data = { name: "Test Game" };
            const gameRepository = { create: jest.fn() };
            const cardRepository = {};

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = createGameService(gameRepository, cardRepository);
            const result = await service(data).run();

            expect(gameRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('rules is required');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not save additional fields", async () => {
            const data = {
                name: "Test Game",
                rules: "Standard",
                userId: "789",
                extraField: "something"
            };
            const createdCard = { _id: "456" };
            const savedGame = {
                _id: "123",
                name: "Test Game",
                rules: "Standard",
                status: "WAITING",
                maxPlayers: 4,
                creatorId: "789",
                playersIds: ["789"],
                turnIndex: 0,
                deck: [],
                topCard: "456",
                history: [],
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const gameRepository = { create: jest.fn().mockReturnValue(AsyncEither.of(savedGame)) };
            const cardRepository = {};

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse");
            jest.spyOn(helpers, "createRandomCard").mockReturnValue({});

            const createCard = jest.fn().mockReturnValue(AsyncEither.of(createdCard));
            createCardService.mockReturnValue(createCard);

            const service = createGameService(gameRepository, cardRepository);
            const result = await service(data).run();

            expect(gameRepository.create).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).not.toHaveProperty('extraField');
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });
    });

    describe("get game by id tests", () => {
        test("returns game by id", async () => {
            const id = "123";
            const stored = {
                _id: id,
                name: "Test Game",
                rules: "Standard",
                status: "WAITING"
            };

            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(stored))
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            jest.spyOn(schemaValidators, "toResponse");

            const service = getGameByIdService(gameRepository);
            const result = await service({ id }).run();

            expect(gameRepository.getById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not return data if id is not provided", async () => {
            const gameRepository = { getById: jest.fn() };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = getGameByIdService(gameRepository);
            const result = await service({ id: "" }).run();

            expect(gameRepository.getById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(toResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('ID required');
        });

        test("does not return data for invalid id", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')))
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = getGameByIdService(gameRepository);
            const result = await service({ id: "invalidId" }).run();

            expect(gameRepository.getById).toHaveBeenCalledWith("invalidId");
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(toResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('Not found');
        });
    });

    describe("update game by id tests", () => {
        test("updates game successfully", async () => {
            const id = "123";
            const data = {
                name: "Updated Game",
                rules: "New Rules"
            };
            const updated = {
                _id: id,
                name: "Updated Game",
                rules: "New Rules",
                status: "WAITING"
            };

            const gameRepository = {
                updateById: jest.fn().mockReturnValue(() => AsyncEither.of(updated))
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse");

            const service = updateGameByIdService(gameRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(gameRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.name).toBe("Updated Game");
        });

        test("does not update if data is incomplete", async () => {
            const id = "123";
            const incompleteData = { name: "Updated Game" };

            const gameRepository = { updateById: jest.fn() };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);
            const updateById = jest.fn();
            gameRepository.updateById.mockReturnValue(updateById);

            const service = updateGameByIdService(gameRepository);
            const result = await service({ id, ...incompleteData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(updateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('rules is required');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not update if no update data is provided", async () => {
            const id = { id: "123" };
            const gameRepository = { updateById: jest.fn() };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);
            const updateById = jest.fn();
            gameRepository.updateById.mockReturnValue(updateById);

            const service = updateGameByIdService(gameRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(updateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('name is required');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not update if id does not exist", async () => {
            const id = "nonexistentId";
            const data = { name: "Updated", rules: "New" };
            const gameRepository = { updateById: jest.fn() };

            const updateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            gameRepository.updateById.mockReturnValue(updateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = updateGameByIdService(gameRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(gameRepository.updateById).toHaveBeenCalledWith(id);
            expect(updateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not update if data contains _id field", async () => {
            const id = "123";
            const data = { _id: "anotherId", name: "Updated" };
            const gameRepository = { updateById: jest.fn() };

            const updateById = jest.fn();
            gameRepository.updateById.mockReturnValue(updateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const validateRequiredFields = jest.fn();
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(validateRequiredFields);
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = updateGameByIdService(gameRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(validateRequiredFields).not.toHaveBeenCalled();
            expect(updateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is empty but data is valid", async () => {
            const id = "";
            const data = { name: "Updated", rules: "New" };
            const gameRepository = { updateById: jest.fn() };
            const updateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            gameRepository.updateById.mockReturnValue(updateById);
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);
            const service = updateGameByIdService(gameRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(gameRepository.updateById).toHaveBeenCalledWith(id);
            expect(updateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(toResponse).not.toHaveBeenCalled();
        });
    });

    describe("partial update game by id tests", () => {
        test("partially updates game successfully", async () => {
            const id = "123";
            const partialData = { name: "Partially Updated" };
            const updated = {
                _id: id,
                name: "Partially Updated",
                rules: "Standard",
                status: "WAITING"
            };

            const gameRepository = {
                updateById: jest.fn().mockReturnValue(() => AsyncEither.of(updated))
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            jest.spyOn(schemaValidators, "toResponse");

            const service = partiallyUpdateGameByIdService(gameRepository);
            const result = await service({ id, ...partialData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(gameRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.name).toBe("Partially Updated");
        });

        test("does not update if no update data is provided", async () => {
            const id = { id: "123" };
            const gameRepository = { updateById: jest.fn() };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(Either.left('No fields to update'));
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);
            const updateById = jest.fn();
            gameRepository.updateById.mockReturnValue(updateById);

            const service = partiallyUpdateGameByIdService(gameRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(updateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('No fields to update');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is invalid", async () => {
            const id = { id: "invalidId", name: "new" };
            const gameRepository = { updateById: jest.fn() };

            const updateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            gameRepository.updateById.mockReturnValue(updateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = partiallyUpdateGameByIdService(gameRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(gameRepository.updateById).toHaveBeenCalledWith("invalidId");
            expect(updateById).toHaveBeenCalledWith({ id: "invalidId", name: "new" });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is empty", async () => {
            const id = { id: "", name: "new" };
            const gameRepository = { updateById: jest.fn() };

            const updateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            gameRepository.updateById.mockReturnValue(updateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = partiallyUpdateGameByIdService(gameRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(gameRepository.updateById).toHaveBeenCalledWith("");
            expect(updateById).toHaveBeenCalledWith({ id: "", name: "new" });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not partially update if data contains _id field", async () => {
            const id = "123";
            const data = { _id: "anotherId", name: "new" };
            const gameRepository = { updateById: jest.fn() };

            const updateById = jest.fn();
            gameRepository.updateById.mockReturnValue(updateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const validateAtLeastOneField = jest.fn();
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(validateAtLeastOneField);
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);

            const service = partiallyUpdateGameByIdService(gameRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(validateAtLeastOneField).not.toHaveBeenCalled();
            expect(updateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(toResponse).not.toHaveBeenCalled();
        });
    });

    describe("delete game by id tests", () => {
        test("deletes game successfully", async () => {
            const id = "123";
            const deletedGame = {
                _id: id,
                name: "Test Game",
                rules: "Standard"
            };

            const gameRepository = {
                deleteById: jest.fn().mockReturnValue(AsyncEither.of(deletedGame))
            };
            jest.spyOn(sharedValidators, "validateIdExistence");
            jest.spyOn(schemaValidators, "toResponse");

            const service = deleteGameByIdService(gameRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(gameRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not delete if id is empty", async () => {
            const gameRepository = { deleteById: jest.fn() };
            jest.spyOn(sharedValidators, "validateIdExistence");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);
            const service = deleteGameByIdService(gameRepository);
            const result = await service({ id: "" }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(gameRepository.deleteById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID required');
            expect(toResponse).not.toHaveBeenCalled();
        });

        test("does not delete if id does not exist", async () => {
            const id = "invalidId";
            const gameRepository = {
                deleteById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')))
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const toResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(toResponse);
            const service = deleteGameByIdService(gameRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(gameRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(toResponse).not.toHaveBeenCalled();
        });
    });

    describe("join game tests", () => {
        const tokenData = {
            token: "validToken",
            gameId: "123"
        };
        const user = {
            _id: "789",
            username: "joaquin"
        };
        const game = {
            _id: "123",
            playersIds: ["user456"],
            status: "WAITING"
        };
        const updatedGame = { ...game, playersIds: ["user456", "789"] };

        test("joins game successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game)),
                updateById: jest.fn().mockReturnValue(() => AsyncEither.of(updatedGame))
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);

            jest.spyOn(helpers, "selectField");
            jest.spyOn(helpers, "pushToArrayField");

            const updateById = jest.fn().mockReturnValue(AsyncEither.of(updatedGame));
            gameRepository.updateById.mockReturnValue(updateById);

            const service = joinGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(tokenService.verifyToken).toHaveBeenCalledWith(tokenData);
            expect(getUserByUsernameService).toHaveBeenCalledWith(userRepository);
            expect(getUserByUsername).toHaveBeenCalledWith({ username: "joaquin" });
            expect(helpers.selectField).toHaveBeenCalledWith("_id");
            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(helpers.pushToArrayField).toHaveBeenCalledWith("playersIds", "789");
            expect(gameRepository.updateById).toHaveBeenCalledWith("123");
            expect(updateById).toHaveBeenCalledWith(updatedGame);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(updatedGame);
        });

        test("fails if token invalid", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Invalid token')))
            };

            const service = joinGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(tokenService.verifyToken).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Invalid token');
        });

        test("fails if user not found", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };
            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            getUserByUsernameService.mockReturnValue(getUserByUsername);

            const service = joinGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(getUserByUsernameService).toHaveBeenCalled();
            expect(getUserByUsername).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found'))),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");

            const service = joinGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if user already in game", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of({ ...game, playersIds: ["789"] })),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(helpers, "pushToArrayField");

            const service = joinGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(helpers.pushToArrayField).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Already in');
        });
    });

    describe("start game tests", () => {
        const tokenData = { token: "validToken", gameId: "123" };
        const user = { _id: "creatorId", username: "creator" };
        const game = {
            _id: "123",
            creatorId: "creatorId",
            playersIds: ["creatorId", "player2"],
            status: "WAITING"
        };
        const players = [
            { _id: "creatorId", username: "creator", isReady: true },
            { _id: "player2", username: "player2", isReady: true }
        ];

        const playersWithStatus = {
            ...players,
            status: "IN_PROGRESS"
        };

        test("starts game successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game)),
                updateById: jest.fn().mockReturnValue(() => AsyncEither.of(playersWithStatus))
            };
            const userRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(players))
            };
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);

            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "isCreator");
            jest.spyOn(schemaValidators, "everyPlayerReady");
            jest.spyOn(helpers, "updateField");

            const updateById = jest.fn().mockReturnValue(AsyncEither.of(playersWithStatus));
            gameRepository.updateById.mockReturnValue(updateById);

            const service = startGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(tokenService.verifyToken).toHaveBeenCalled();
            expect(getUserByUsernameService).toHaveBeenCalledWith(userRepository);
            expect(getUserByUsername).toHaveBeenCalledWith({ username: "creator" });
            expect(helpers.selectField).toHaveBeenCalledWith("_id");
            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(schemaValidators.isCreator).toHaveBeenCalled();
            expect(userRepository.getByIds).toHaveBeenCalledWith(game.playersIds);
            expect(schemaValidators.everyPlayerReady).toHaveBeenCalledWith(players);
            expect(helpers.updateField).toHaveBeenCalledWith("status", "IN_PROGRESS");
            expect(gameRepository.updateById).toHaveBeenCalledWith("123");
            expect(updateById).toHaveBeenCalledWith(playersWithStatus);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(playersWithStatus);
        });

        test("fails if token invalid", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Invalid token')))
            };

            const service = startGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Invalid token');
        });

        test("fails if user not found", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            getUserByUsernameService.mockReturnValue(getUserByUsername);

            const service = startGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found'))),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");

            const service = startGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if user is not creator", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game)),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of({ _id: "otherId" }));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "isCreator");

            const service = startGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(schemaValidators.isCreator).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Only creator can start a game');
        });

        test("fails if not all players ready", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game)),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of([
                    { _id: "creatorId", isReady: true },
                    { _id: "player2", isReady: false }
                ]))
            };
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "isCreator");
            jest.spyOn(schemaValidators, "everyPlayerReady");

            const service = startGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(schemaValidators.everyPlayerReady).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not all players are ready');
        });
    });

    describe("leave game tests", () => {
        const tokenData = { token: "validToken", gameId: "123" };
        const user = { _id: "789", username: "joaquin" };
        const game = {
            _id: "123",
            playersIds: ["789", "user456"],
            status: "IN_PROGRESS"
        };
        const updatedGame = { ...game, playersIds: ["user456"] };

        test("leaves game successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game)),
                updateById: jest.fn().mockReturnValue(() => AsyncEither.of(updatedGame))
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "validateGameInProgress");
            jest.spyOn(schemaValidators, "isPlayerInGame");
            jest.spyOn(helpers, "removeFromArrayField");

            const updateById = jest.fn().mockReturnValue(AsyncEither.of(updatedGame));
            gameRepository.updateById.mockReturnValue(updateById);

            const service = leaveGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(tokenService.verifyToken).toHaveBeenCalled();
            expect(getUserByUsernameService).toHaveBeenCalled();
            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(schemaValidators.validateGameInProgress).toHaveBeenCalled();
            expect(schemaValidators.isPlayerInGame).toHaveBeenCalledWith("789");
            expect(helpers.removeFromArrayField).toHaveBeenCalledWith("playersIds", "789");
            expect(gameRepository.updateById).toHaveBeenCalledWith("123");
            expect(updateById).toHaveBeenCalledWith(updatedGame);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(updatedGame);
        });

        test("fails if token invalid", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Invalid token')))
            };

            const service = leaveGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Invalid token');
        });

        test("fails if user not found", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            getUserByUsernameService.mockReturnValue(getUserByUsername);

            const service = leaveGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found'))),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");

            const service = leaveGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if game not in progress", async () => {
            const waitingGame = { ...game, status: "WAITING" };
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(waitingGame)),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "joaquin" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "validateGameInProgress");

            const service = leaveGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(schemaValidators.validateGameInProgress).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Game is not in progress');
        });

    });

    describe("end game tests", () => {
        const tokenData = { token: "validToken", gameId: "123" };
        const user = { _id: "creatorId", username: "creator" };
        const game = {
            _id: "123",
            creatorId: "creatorId",
            status: "IN_PROGRESS"
        };
        const updatedGame = { ...game, status: "FINISHED" };

        test("ends game successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game)),
                updateById: jest.fn().mockReturnValue(() => AsyncEither.of(updatedGame))
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "validateGameInProgress");
            jest.spyOn(schemaValidators, "isCreator");
            jest.spyOn(helpers, "updateField");

            const updateById = jest.fn().mockReturnValue(AsyncEither.of(updatedGame));
            gameRepository.updateById.mockReturnValue(updateById);

            const service = endGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(tokenService.verifyToken).toHaveBeenCalled();
            expect(getUserByUsernameService).toHaveBeenCalled();
            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(schemaValidators.validateGameInProgress).toHaveBeenCalled();
            expect(schemaValidators.isCreator).toHaveBeenCalledWith("creatorId");
            expect(helpers.updateField).toHaveBeenCalledWith("status", "FINISHED");
            expect(gameRepository.updateById).toHaveBeenCalledWith("123");
            expect(updateById).toHaveBeenCalledWith(updatedGame);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(updatedGame);
        });

        test("fails if token invalid", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Invalid token')))
            };

            const service = endGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Invalid token');
        });

        test("fails if user not found", async () => {
            const gameRepository = {
                getById: jest.fn(),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            getUserByUsernameService.mockReturnValue(getUserByUsername);

            const service = endGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found'))),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");

            const service = endGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if game not in progress", async () => {
            const finishedGame = { ...game, status: "FINISHED" };
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(finishedGame)),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of(user));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "validateGameInProgress");

            const service = endGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(schemaValidators.validateGameInProgress).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Game is not in progress');
        });

        test("fails if user is not creator", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game)),
                updateById: jest.fn().mockReturnValue(jest.fn())
            };
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn().mockReturnValue(AsyncEither.of({ username: "creator" }))
            };

            const getUserByUsername = jest.fn().mockReturnValue(AsyncEither.of({ _id: "otherId" }));
            getUserByUsernameService.mockReturnValue(getUserByUsername);
            jest.spyOn(helpers, "selectField");
            jest.spyOn(schemaValidators, "validateGameInProgress");
            jest.spyOn(schemaValidators, "isCreator");

            const service = endGameService(gameRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(schemaValidators.isCreator).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Only creator can start a game');
        });
    });

    describe("get players names tests", () => {
        const data = { gameId: "123" };
        const game = { _id: "123", playersIds: ["456", "789"] };
        const players = [
            { _id: "456", username: "joaquin" },
            { _id: "789", username: "pablo" }
        ];

        test("returns players names successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const userRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(players))
            };

            jest.spyOn(schemaValidators, "extractArrayField");

            const service = getPlayersNamesService(userRepository, gameRepository);
            const result = await service(data).run();

            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(userRepository.getByIds).toHaveBeenCalledWith(["456", "789"]);
            expect(schemaValidators.extractArrayField).toHaveBeenCalledWith("username");
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(["joaquin", "pablo"]);
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')))
            };
            const userRepository = {};

            const service = getPlayersNamesService(userRepository, gameRepository);
            const result = await service(data).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });
    });

    describe("get current player tests", () => {
        const data = { gameId: "123" };
        const game = { _id: "123", playersIds: ["456", "789"], turnIndex: 1 };
        const currentUser = { _id: "789", username: "pablo" };

        test("returns current player successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const userRepository = {};

            jest.spyOn(helpers, "getCurrentPlayerId");

            const getUserById = jest.fn().mockReturnValue(AsyncEither.of(currentUser));
            getUserByIdService.mockReturnValue(getUserById);

            const service = getCurrentPlayerService(userRepository, gameRepository);
            const result = await service(data).run();

            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(helpers.getCurrentPlayerId).toHaveBeenCalledWith(game);
            expect(getUserByIdService).toHaveBeenCalledWith(userRepository);
            expect(getUserById).toHaveBeenCalledWith({ id: "789" });
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(currentUser);
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')))
            };
            const userRepository = {};

            const service = getCurrentPlayerService(userRepository, gameRepository);
            const result = await service(data).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if user not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const userRepository = {};

            jest.spyOn(helpers, "getCurrentPlayerId");

            const getUserById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            getUserByIdService.mockReturnValue(getUserById);

            const service = getCurrentPlayerService(userRepository, gameRepository);
            const result = await service(data).run();

            expect(getUserByIdService).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });
    });

    describe("get top card tests", () => {
        const data = { gameId: "123" };
        const game = { _id: "123", topCard: "999" };
        const card = { _id: "999", color: "RED", value: 5, type: "NUMBER" };

        test("returns top card successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const cardRepository = {};

            jest.spyOn(helpers, "selectField");

            const getCardById = jest.fn().mockReturnValue(AsyncEither.of(card));
            getCardByIdService.mockReturnValue(getCardById);

            const service = getTopCardService(gameRepository, cardRepository);
            const result = await service(data).run();

            expect(gameRepository.getById).toHaveBeenCalledWith("123");
            expect(helpers.selectField).toHaveBeenCalledWith("topCard");
            expect(getCardByIdService).toHaveBeenCalledWith(cardRepository);
            expect(getCardById).toHaveBeenCalledWith({ id: "999" });
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(card);
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')))
            };
            const cardRepository = {};

            const service = getTopCardService(gameRepository, cardRepository);
            const result = await service(data).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if card not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const cardRepository = {};

            jest.spyOn(helpers, "selectField");

            const getCardById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            getCardByIdService.mockReturnValue(getCardById);

            const service = getTopCardService(gameRepository, cardRepository);
            const result = await service(data).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });
    });

    describe("getGamePlayers", () => {
        test("returns players from userRepository.getByIds", async () => {
            const game = { playersIds: ["123", "456"] };
            const players = [{ _id: "123" }, { _id: "456" }];
            const userRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(players))
            };
            const service = getGamePlayers(userRepository);
            const result = await service(game).run();

            expect(userRepository.getByIds).toHaveBeenCalledWith(["123", "456"]);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(players);
        });

        test("fails if userRepository.getByIds fails", async () => {
            const game = { playersIds: ["123"] };
            const userRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left("Not found")))
            };
            const service = getGamePlayers(userRepository);
            const result = await service(game).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("getPlayerHandService", () => {
        test("returns cards of a player", async () => {
            const player = { hand: ["123", "456"] };
            const cards = [{ _id: "123" }, { _id: "456" }];
            const cardRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(cards))
            };
            const service = getPlayerHandService(cardRepository);
            const result = await service(player).run();

            expect(cardRepository.getByIds).toHaveBeenCalledWith(["123", "456"]);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(cards);
        });

        test("fails if cardRepository.getByIds fails", async () => {
            const player = { hand: ["123"] };
            const cardRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left("Error")))
            };
            const service = getPlayerHandService(cardRepository);
            const result = await service(player).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Error");
        });
    });

    describe("getGameByUserIdService", () => {
        test("returns game by user id", async () => {
            const userId = "999";
            const game = { _id: "666" };
            const gameRepository = {
                getGameByUserId: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const service = getGameByUserIdService(gameRepository);
            const result = await service(userId).run();

            expect(gameRepository.getGameByUserId).toHaveBeenCalledWith(userId);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(game);
        });

        test("fails if game not found", async () => {
            const userId = "999";
            const gameRepository = {
                getGameByUserId: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left("Not found")))
            };
            const service = getGameByUserIdService(gameRepository);
            const result = await service(userId).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("getGameHistoryService", () => {
        test("returns game history", async () => {
            const data = { gameId: "456" };
            const game = { _id: "456", history: ["player drew a card", "player played a card"] };
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const service = getGameHistoryService(gameRepository);
            const result = await service(data).run();

            expect(gameRepository.getById).toHaveBeenCalledWith("456");
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(["player drew a card", "player played a card"]);
        });

        test("fails if game not found", async () => {
            const data = { gameId: "456" };
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left("Not found")))
            };
            const service = getGameHistoryService(gameRepository);
            const result = await service(data).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("dealCardsService", () => {
        test("deals cards to players successfully", async () => {
            const data = {
                players: ["player1", "player2"],
                cardsPerPlayer: 2
            };
            const createdCardIds = ["123", "456", "789", "101"];
            const playersFromDb = [
                {_id: "999",username:"player1",hand: []},
                {_id: "001",username:"player2",hand: []}
            ];
            const updatedPlayers = [
                {_id: "999", username:"player1", hand:["123", "456"]},
                {_id: "001", username:"player2", hand:["789", "101"]}
            ];
            const cards = [
                {_id: "123", color: "RED", value: 5, type: "NUMBER"},
                {_id: "456", color: "BLUE", value: 7, type: "NUMBER"},
                {_id: "789", color: "GREEN", value: 3, type: "NUMBER"},
                {_id: "101", color: "YELLOW", value: 9, type: "NUMBER"}
            ];
            const finalHands = {"player1": ["RED NUMBER 5", "BLUE NUMBER 7"], "player2": ["GREEN NUMBER 3", "YELLOW NUMBER 9"]};

            jest.spyOn(helpers, "createMultipleCards");
            jest.spyOn(helpers, "dealCards");
            jest.spyOn(schemaValidators, "extractArrayField");

            const userRepository = {
                getUsersByUsername: jest.fn().mockReturnValue(AsyncEither.of(playersFromDb)),
                updateMultiple: jest.fn().mockReturnValue((datas) => AsyncEither.of(updatedPlayers))
            };
            const cardRepository = {
                createMultiple: jest.fn().mockReturnValue(AsyncEither.of(createdCardIds)),
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(cards))
            };
            const service = dealCardsService(userRepository, cardRepository);
            const result = await service(data).run();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(finalHands);
            expect(cardRepository.getByIds).toHaveBeenCalled();
        });
        
    });

    describe("getHandByUsernameService", () => {
        test("returns hand formatted", async () => {
            const data = {player: "joaquin"};
            const user = {hand: ["123"]};
            const cards = [{_id: "123", color: "RED", type: "NUMBER", value: 5}];

            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            const cardRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(cards))
            };
            const userRepository = {};
            const service = getHandByUsernameService(cardRepository, userRepository);
            const result = await service(data).run();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(["RED NUMBER 5"]);
        });

        test("fails if user not found", async () => {
            const data = { player: "joaquin" };
            getUserByUsernameService.mockReturnValue(() => AsyncEither.fromEither(Either.left("Not found")));
            const cardRepository = {};
            const userRepository = {};
            const service = getHandByUsernameService(cardRepository, userRepository);
            const result = await service(data).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("getPlayersHandsService", () => {
        test("returns players with handCards populated", async () => {
            const players = [
                {_id: "999", hand: ["123", "456"]},
                {_id: "001", hand: ["789"]}
            ];
            const cards = [
                {_id: "123", color: "RED"},
                {_id: "456", color: "BLUE"},
                {_id: "789", color: "GREEN"}
            ];
            const cardRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(cards))
            };
            const service = getPlayersHandsService(cardRepository);
            const result = await service(players).run();

            expect(result.isRight()).toBe(true);
            expect(result.value).toHaveLength(2);
            expect(result.value[0].handCards).toHaveLength(2);
        });
    });

    describe("sayUnoService", () => {
        test("fails if more than one card", async () => {
            const data = { player: "joaquin" };
            const user = { hand: ["123", "456"] };
            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            jest.spyOn(schemaValidators, "validateOnlyOneCard")
            const service = sayUnoService({});
            const result = await service(data).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("More than one card left");
        });
    });
    describe("getAllScoresService", () => {
        const data = {gameId: "123"};
        const game = {_id: "123"};
        const scores = [{userId: "456", value: 10}];
        const users = [{ _id: "456", username: "joaquin"}];

        test("returns scores successfully", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const scoreRepository = {
                getByGameId: jest.fn().mockReturnValue(AsyncEither.of(scores))
            };
            const userRepository = {
                getByIds: jest.fn().mockReturnValue(AsyncEither.of(users))
            };

            jest.spyOn(helpers, "buildScoresByUsername")
            const service = getAllScoresService(gameRepository, userRepository, scoreRepository);
            const result = await service(data).run();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual({ joaquin: 10 });
        });

        test("fails if game not found", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left("Not found")))
            };
            const service = getAllScoresService(gameRepository, {}, {});
            const result = await service(data).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });

        test("fails if scoreRepository getByGameId returns error", async () => {
            const gameRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(game))
            };
            const scoreRepository = {
                getByGameId: jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left("Error")))
            };
            const service = getAllScoresService(gameRepository, {}, scoreRepository);
            const result = await service(data).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Error");
        });
    });
    describe("playCardService", () => {
        let cardRepository;
        let userRepository;
        let gameRepository;

        beforeEach(() => {
            cardRepository = {
                getById: jest.fn().mockReturnValue(AsyncEither.of(null)),
                getByIds: jest.fn().mockReturnValue(AsyncEither.of([])),
                updateById: jest.fn().mockImplementation((id) => {
                    return (data) => AsyncEither.of(data);
                })
            };

            userRepository = {
                updateById: jest.fn().mockImplementation((id) => {
                    return (data) => AsyncEither.of(data);
                }),
                getById: jest.fn().mockReturnValue(AsyncEither.of(null))
            };

            gameRepository = {
                getGameByUserId: jest.fn().mockReturnValue(AsyncEither.of(null)),
                updateById: jest.fn().mockImplementation((id) => {
                    return (data) => AsyncEither.of(data);
                })
            };
        });

        test("plays regular NUMBER card successfully", async() => {
            const data = { player: "joaquin", cardPlayed: "123", chosenColor: null };
            const user = { _id: "456", username: "joaquin", hand: ["123"] };
            const game = { _id: "789", playersIds: ["456","101"], turnIndex: 0, topCard: "131" };
            const topCard = { _id: "131", color: "RED", value: 3, type: "NUMBER" };
            const playedCard = { _id: "123", color: "RED", value: 5, type: "NUMBER" };

            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            gameRepository.getGameByUserId.mockReturnValue(AsyncEither.of(game));
            cardRepository.getByIds.mockReturnValue(AsyncEither.of([playedCard]));
            cardRepository.getById.mockReturnValue(AsyncEither.of(topCard));
            getCardByIdService.mockReturnValue(({ id }) => cardRepository.getById(id));

            jest.spyOn(schemaValidators, "verifyTurn").mockImplementation(() => (game) => Either.right(game));
            jest.spyOn(schemaValidators, "isOnHand").mockImplementation(() =>
                () => Either.right({ playedCard, updatedHand: [] })
            );
            jest.spyOn(schemaValidators, "isValidCardPlay").mockImplementation(() =>
                () => Either.right(true)
            );

            const gameService = require("../../../src/application/services/gameService.js");
            jest.spyOn(gameService, "resolveCardEffectService")
                .mockReturnValue(() => AsyncEither.of({
                    playedCard,
                    nextPlayerId: game.playersIds[1],
                    effectData: {},
                    updatedGame: { ...game, turnIndex: 1 }
                }));

            const service = playCardService(gameRepository, userRepository, cardRepository);
            const result = await service(data).run();

            expect(result.isRight()).toBe(true);
            expect(result.value.playedCard).toEqual(playedCard);
        });

        test("plays SKIP card successfully", async() => {
            const data = { player: "joaquin", cardPlayed: "415", chosenColor: null };
            const user = { _id: "456", username: "joaquin", hand: ["415"] };
            const game = { _id: "789", playersIds: ["456","101","112"], turnIndex: 0, topCard: "131" };
            const topCard = { _id: "131", color: "RED", value: 3, type: "NUMBER" };
            const playedCard = { _id: "415", color: "BLUE", type: "SKIP" };

            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            gameRepository.getGameByUserId.mockReturnValue(AsyncEither.of(game));
            cardRepository.getByIds.mockReturnValue(AsyncEither.of([playedCard]));
            cardRepository.getById.mockReturnValue(AsyncEither.of(topCard));
            getCardByIdService.mockReturnValue(({ id }) => cardRepository.getById(id));
            jest.spyOn(schemaValidators, "verifyTurn").mockImplementation(() => (game) => Either.right(game));
            jest.spyOn(schemaValidators, "isOnHand").mockImplementation(() =>
                () => Either.right({ playedCard, updatedHand: [] })
            );
            jest.spyOn(schemaValidators, "isValidCardPlay").mockImplementation(() =>
                () => Either.right(true)
            );
            const helpers = require("../../../src/domain/helpers/helpers.js");
            jest.spyOn(helpers, "applyCardEffect").mockReturnValue({
                skipped: true
            });
            const service = playCardService(gameRepository, userRepository, cardRepository);
            const result = await service(data).run();

            expect(result.isRight()).toBe(true);
            expect(result.value.effectData).toBeDefined();
        });

        test("plays REVERSE card successfully", async() => {
            const data = { player: "joaquin", cardPlayed: "161", chosenColor: null };
            const user = { _id: "456", username: "joaquin", hand: ["161"] };
            const game = {
                _id: "789",
                playersIds: ["456","101","112"],
                turnIndex: 0,
                topCard: "131",
                direction: 1
            };
            const topCard = { _id: "131", color: "YELLOW", type: "NUMBER" };
            const playedCard = { _id: "161", color: "YELLOW", type: "REVERSE" };

            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            gameRepository.getGameByUserId.mockReturnValue(AsyncEither.of(game));
            cardRepository.getByIds.mockReturnValue(AsyncEither.of([playedCard]));
            cardRepository.getById.mockReturnValue(AsyncEither.of(topCard));
            getCardByIdService.mockReturnValue(({ id }) => cardRepository.getById(id));

            jest.spyOn(schemaValidators, "verifyTurn").mockImplementation(() => (game) => Either.right(game));
            jest.spyOn(schemaValidators, "isOnHand").mockImplementation(() =>
                () => Either.right({ playedCard, updatedHand: [] })
            );
            jest.spyOn(schemaValidators, "isValidCardPlay").mockImplementation(() =>
                () => Either.right(true)
            );

            const helpers = require("../../../src/domain/helpers/helpers.js");
            jest.spyOn(helpers, "applyCardEffect").mockReturnValue({
                reversed: true
            });
            const service = playCardService(gameRepository, userRepository, cardRepository);
            const result = await service(data).run();

            expect(result.isRight()).toBe(true);
            expect(result.value.effectData).toBeDefined();
        });
    });
});