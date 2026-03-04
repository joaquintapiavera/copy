import { createUserService, getUserByIdService, updateUserByIdService, partiallyUpdateUserByIdService, deleteUserByIdService, getUserByUsernameService, getUserByTokenService } from "../../../src/application/services/userService.js";
import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import * as schemaValidators from "../../../src/domain/validators/schemaValidators.js"
import * as sharedValidators from "../../../src/domain/validators/sharedValidators.js"
import * as helpers from "../../../src/domain/helpers/helpers.js";
import { Either } from "../../../src/shared/monads/Either.js";
import { getSessionByTokenService } from "../../../src/application/services/sessionService.js";

jest.mock("../../../src/application/services/sessionService.js");

afterEach(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.resetModules();
});

describe("user service unit tests", () => {
    describe("create user tests", () => {
        test("creates user with valid data", async () => {
            const user = {
                username: "joaquin",
                email: "joaquin@example.com",
                password: "secret"
            };
            const savedUser = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@example.com",
                password: "hashed",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const userRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse");

            userRepository.create.mockReturnValue(AsyncEither.of(savedUser));
            const service = createUserService(userRepository);
            const result = await service(user).run();

            expect(userRepository.create).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value._id).toBe(savedUser._id);
            expect(result.value.username).toBe(savedUser.username);
            expect(result.value.email).toBe(savedUser.email);
            expect(result.value.password).toBeUndefined();
        });

        test("does not create a user if there is no data", async () => {
            const user = {};

            const userRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse");

            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createUserService(userRepository);
            const result = await service(user).run();

            expect(userRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('username is required');
        });

        test("does not create a user if required fields are incomplete", async () => {
            const user = {
                username: "joaquin"
            };

            const userRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse");

            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createUserService(userRepository);
            const result = await service(user).run();

            expect(userRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('email is required');
        });

        test("does not save additional fields", async () => {
            const user = {
                username: "joaquin",
                email: "joaquin@example.com",
                password: "secret",
                extraField: "something"
            };
            const savedUser = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@example.com",
                password: "hashed",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const userRepository = {
                create: jest.fn()
            };
            userRepository.create.mockReturnValue(AsyncEither.of(savedUser));

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse");

            const service = createUserService(userRepository);
            const result = await service(user).run();

            expect(userRepository.create).toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value).not.toHaveProperty('extraField');
        });
    });

    describe("get user by id tests", () => {
        test("returns user by id", async () => {
            const id = "123";
            const stored = {
                _id: id,
                username: "joaquin",
                email: "joaquin@example.com",
                password: "hashed",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const userRepository = {
                getById: jest.fn()
            };
            userRepository.getById.mockReturnValue(AsyncEither.of(stored));

            jest.spyOn(sharedValidators, "validateIdExistence");
            jest.spyOn(schemaValidators, "toResponse");

            const service = getUserByIdService(userRepository);
            const result = await service({ id }).run();

            expect(userRepository.getById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(false);
            expect(result.value._id).toBe(id);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not return data if id is not provided", async () => {
            const userRepository = {
                getById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getUserByIdService(userRepository);
            const result = await service({ id: "" }).run();

            expect(userRepository.getById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('ID required');
        });

        test("does not return data for invalid id", async () => {
            const userRepository = {
                getById: jest.fn()
            };
            userRepository.getById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getUserByIdService(userRepository);
            const result = await service({ id: "invalidId" }).run();

            expect(userRepository.getById).toHaveBeenCalledWith("invalidId");
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('Not found');
        });
    });

    describe("update user by id tests", () => {
        test("updates user successfully", async () => {
            const id = "123";
            const data = {
                username: "joaquin_updated",
                email: "joaquin_new@example.com",
                password: "newsecret"
            };
            const updated = {
                _id: id,
                username: "joaquin_updated",
                email: "joaquin_new@example.com",
                password: "hashed_new",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const userRepository = {
                updateById: jest.fn()
            };
            userRepository.updateById.mockReturnValue((data) => AsyncEither.of(updated));

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse");

            const service = updateUserByIdService(userRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(userRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.username).toBe("joaquin_updated");
            expect(result.value.email).toBe("joaquin_new@example.com");
        });

        test("does not update if data is incomplete", async () => {
            const id = "123";
            const incompleteData = {
                username: "joaquin_updated"
            };

            const userRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(userRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = updateUserByIdService(userRepository);
            const result = await service({ id, ...incompleteData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('email is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if no update data is provided", async () => {
            const id = { id: "123" };
            const userRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(userRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = updateUserByIdService(userRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('username is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id does not exist", async () => {
            const id = "nonexistentId";
            const data = {
                username: "joaquin_updated",
                email: "joaquin@example.com",
                password: "secret"
            };
            const userRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            userRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            const curriedValidateRequiredFields = jest.fn().mockImplementation(data => Either.right(data));
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateUserByIdService(userRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateRequiredFields).toHaveBeenCalled();
            expect(userRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if data contains _id field", async () => {
            const id = "123";
            const data = {
                _id: "anotherId",
                username: "joaquin_updated",
                email: "joaquin@example.com",
                password: "secret"
            };
            const userRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            userRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateRequiredFields = jest.fn();
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateUserByIdService(userRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateRequiredFields).not.toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is empty but data is valid", async () => {
            const id = "";
            const data = {
                username: "joaquin_updated",
                email: "joaquin@example.com",
                password: "secret"
            };
            const userRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            userRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateUserByIdService(userRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(userRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("partial update user by id tests", () => {
        test("partially updates user successfully", async () => {
            const id = "123";
            const partialData = {
                username: "joaquin_partial"
            };
            const updated = {
                _id: id,
                username: "joaquin_partial",
                email: "joaquin@example.com",
                password: "hashed",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const userRepository = {
                updateById: jest.fn()
            };
            userRepository.updateById.mockReturnValue((data) => AsyncEither.of(updated));

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            jest.spyOn(schemaValidators, "toResponse");

            const service = partiallyUpdateUserByIdService(userRepository);
            const result = await service({ id, ...partialData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(userRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.username).toBe("joaquin_partial");
        });

        test("does not update if no update data is provided", async () => {
            const id = { id: "123" };
            const userRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(Either.left('No fields to update'));
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(userRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = partiallyUpdateUserByIdService(userRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('No fields to update');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is invalid", async () => {
            const id = { id: "invalidId", username: "new" };
            const userRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            userRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateUserByIdService(userRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(userRepository.updateById).toHaveBeenCalledWith("invalidId");
            expect(curriedUpdateById).toHaveBeenCalledWith({ id: "invalidId", username: "new" });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is empty", async () => {
            const id = { id: "", username: "new" };
            const userRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            userRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateUserByIdService(userRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(userRepository.updateById).toHaveBeenCalledWith("");
            expect(curriedUpdateById).toHaveBeenCalledWith({ id: "", username: "new" });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not partially update if data contains _id field", async () => {
            const id = "123";
            const data = {
                _id: "anotherId",
                username: "new"
            };
            const userRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            userRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateAtLeastOneField = jest.fn();
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(curriedValidateAtLeastOneField);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateUserByIdService(userRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateAtLeastOneField).not.toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("delete user by id tests", () => {
        test("deletes user successfully", async () => {
            const id = "123";
            const deletedUser = {
                _id: id,
                username: "joaquin",
                email: "joaquin@example.com",
                password: "hashed",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const userRepository = {
                deleteById: jest.fn()
            };
            userRepository.deleteById.mockReturnValue(AsyncEither.of(deletedUser));
            jest.spyOn(sharedValidators, "validateIdExistence");
            jest.spyOn(schemaValidators, "toResponse");

            const service = deleteUserByIdService(userRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(userRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not delete the user if id is empty", async () => {
            const userRepository = {
                deleteById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = deleteUserByIdService(userRepository);
            const result = await service({ id: "" }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(userRepository.deleteById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not delete the user if id does not exist", async () => {
            const id = "invalidId";
            const userRepository = {
                deleteById: jest.fn()
            };
            userRepository.deleteById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = deleteUserByIdService(userRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(userRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("get user by username tests", () => {
        test("returns user by username", async () => {
            const username = "joaquin";
            const stored = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@example.com",
                password: "hashed",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const userRepository = {
                getByUsername: jest.fn()
            };
            userRepository.getByUsername.mockReturnValue(AsyncEither.of(stored));

            const service = getUserByUsernameService(userRepository);
            const result = await service({ username }).run();

            expect(userRepository.getByUsername).toHaveBeenCalledWith(username);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(stored._id);
        });

        test("does not return data if username not found", async () => {
            const username = "nonexistent";
            const userRepository = {
                getByUsername: jest.fn()
            };
            userRepository.getByUsername.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            const service = getUserByUsernameService(userRepository);
            const result = await service({ username }).run();

            expect(userRepository.getByUsername).toHaveBeenCalledWith(username);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("handles empty username", async () => {
            const username = "";
            const userRepository = {
                getByUsername: jest.fn()
            };
            userRepository.getByUsername.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            const service = getUserByUsernameService(userRepository);
            const result = await service({ username }).run();

            expect(userRepository.getByUsername).toHaveBeenCalledWith("");
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });
    });

    describe("get user by token tests", () => {
        beforeEach(() => {
            getSessionByTokenService.mockClear();
        });

        test("returns user by token successfully", async () => {
            const tokenData = { token: "validToken" };
            const session = { userId: "123" };
            const user = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@example.com",
                password: "hashed",
                isReady: false,
                saidUno: false,
                hand: [],
                score: 0,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {};
            const userRepository = {
                getByUsername: jest.fn()
            };
            const tokenService = {
                verifyToken: jest.fn()
            };

            const mockSessionService = jest.fn().mockReturnValue(AsyncEither.of(session));
            getSessionByTokenService.mockReturnValue(mockSessionService);

            tokenService.verifyToken.mockReturnValue(AsyncEither.of({ username: "joaquin" }));
            userRepository.getByUsername.mockReturnValue(AsyncEither.of(user));

            jest.spyOn(schemaValidators, "toResponse");

            const service = getUserByTokenService(sessionRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(getSessionByTokenService).toHaveBeenCalledWith(sessionRepository);
            expect(mockSessionService).toHaveBeenCalledWith(tokenData);
            expect(tokenService.verifyToken).toHaveBeenCalled();
            expect(userRepository.getByUsername).toHaveBeenCalledWith("joaquin");
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(user._id);
        });

        test("fails if session not found", async () => {
            const tokenData = { token: "invalidToken" };
            const sessionRepository = {};
            const userRepository = {};
            const tokenService = {};

            const mockSessionService = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            getSessionByTokenService.mockReturnValue(mockSessionService);

            jest.spyOn(schemaValidators, "toResponse");

            const service = getUserByTokenService(sessionRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(getSessionByTokenService).toHaveBeenCalledWith(sessionRepository);
            expect(mockSessionService).toHaveBeenCalledWith(tokenData);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });

        test("fails if token verification fails", async () => {
            const tokenData = { token: "validToken" };
            const session = { userId: "123" };
            const sessionRepository = {};
            const userRepository = {};
            const tokenService = {
                verifyToken: jest.fn()
            };

            const mockSessionService = jest.fn().mockReturnValue(AsyncEither.of(session));
            getSessionByTokenService.mockReturnValue(mockSessionService);
            tokenService.verifyToken.mockReturnValue(AsyncEither.fromEither(Either.left('Invalid token')));

            jest.spyOn(schemaValidators, "toResponse");

            const service = getUserByTokenService(sessionRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(tokenService.verifyToken).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Invalid token');
        });

        test("fails if user not found by username", async () => {
            const tokenData = { token: "validToken" };
            const session = { userId: "123" };
            const sessionRepository = {};
            const userRepository = {
                getByUsername: jest.fn()
            };
            const tokenService = {
                verifyToken: jest.fn()
            };

            const mockSessionService = jest.fn().mockReturnValue(AsyncEither.of(session));
            getSessionByTokenService.mockReturnValue(mockSessionService);
            tokenService.verifyToken.mockReturnValue(AsyncEither.of({ username: "joaquin" }));
            userRepository.getByUsername.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(schemaValidators, "toResponse");

            const service = getUserByTokenService(sessionRepository, userRepository, tokenService);
            const result = await service(tokenData).run();

            expect(userRepository.getByUsername).toHaveBeenCalledWith("joaquin");
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
        });
    });
});