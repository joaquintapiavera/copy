import {registerService,loginService,logoutService,checkUsernameNotExists, doesNotExistByUsernameService} from "../../../src/application/services/authService.js";
import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import { Either } from "../../../src/shared/monads/Either.js";
import * as sharedValidators from "../../../src/domain/validators/sharedValidators.js";
import * as helpers from "../../../src/domain/helpers/helpers.js";
import { createUserService, getUserByUsernameService } from "../../../src/application/services/userService.js";
import { createSessionService, getSessionByTokenService, partiallyUpdateSessionByTokenService } from "../../../src/application/services/sessionService.js";
jest.mock("../../../src/application/services/userService.js");
jest.mock("../../../src/application/services/sessionService.js");

afterEach(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});

describe("authService tests", () => {
    describe("registerService", () => {
        test("registers a new user with valid data", async () => {
            const userData = {
                username: "joaquin",
                email: "joaquin@gmail.com",
                password: "password123"
            };
            const hashword = "hash";
            const createdUser = {
                _id: "666",
                username: "joaquin",
                email: "joaquin@gmail.com",
                password: hashword
            };

            const userRepository = {
                doesNotExistByUsername: jest.fn()
            };
            userRepository.doesNotExistByUsername.mockReturnValue(AsyncEither.of(null));

            const passwordService = {
                hashPassword: jest.fn()
            };

            passwordService.hashPassword.mockReturnValue(AsyncEither.of({ ...userData, password: hashword }));
            createUserService.mockReturnValue(() => AsyncEither.of(createdUser));

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(helpers, "toDefault");
            const service = registerService(userRepository, passwordService);
            const result = await service(userData).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalledWith(userData);
            expect(userRepository.doesNotExistByUsername).toHaveBeenCalledWith(userData.username);
            expect(passwordService.hashPassword).toHaveBeenCalledWith(userData);
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(createUserService).toHaveBeenCalledWith(userRepository);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(createdUser);
        });

        test("fails if sent data contains id", async () => {
            const userData = { 
                _id: "999",
                username: "joaquin"
            };
            const userRepository = {};
            const passwordService = {};
            const service = registerService(userRepository, passwordService);
            const result = await service(userData).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("ID can not be modified");
        });

        test("fails if username already exists", async () => {
            const userData = {
                username: "pancho"
            };
            const existingUser = {
                username: "pancho"
            };
            const userRepository = {
                doesNotExistByUsername: jest.fn()
            };
            userRepository.doesNotExistByUsername.mockReturnValue(AsyncEither.of(existingUser));
            jest.spyOn(sharedValidators, "rejectIfExists");
            const service = registerService(userRepository, {});
            const result = await service(userData).run();
            expect(userRepository.doesNotExistByUsername).toHaveBeenCalledWith(userData.username);
            expect(sharedValidators.rejectIfExists).toHaveBeenCalledWith(existingUser);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Already Exists");
        });

        test("fails if password hashing fails", async () => {
            const userData = {
                username: "joaquin",
                password: "password123"
            };
            const userRepository = {
                doesNotExistByUsername: jest.fn()
            };
            userRepository.doesNotExistByUsername.mockReturnValue(AsyncEither.of(null));
            const passwordService = {
                hashPassword: jest.fn(() => AsyncEither.fromEither(Either.left("Hashing error")))
            };
            const service = registerService(userRepository, passwordService);
            const result = await service(userData).run();

            expect(userRepository.doesNotExistByUsername).toHaveBeenCalledWith(userData.username);
            expect(passwordService.hashPassword).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Hashing error");
        });
    });

    describe("loginService", () => {
        test("logs in successfully and returns token", async () => {
            const loginData = {
                username: "joaquin",
                password: "password123"
            };
            const user = {
                _id: "666",
                username: "joaquin",
                password: "hash"
            };
            const token = "validToken";
            const sessionData = {
                token: token, 
                userId: "666",
                revoked: false
            };
            const createdSession = {
                _id: "789",
                ...sessionData
            };
            const userRepository = {};
            const sessionRepository = {};
            const tokenService = { generateToken: jest.fn() };
            const passwordService = { compare: jest.fn() };

            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            passwordService.compare.mockReturnValue(() => AsyncEither.of(user));
            tokenService.generateToken.mockReturnValue(AsyncEither.of({ token, userId: user._id }));
            createSessionService.mockReturnValue(() => AsyncEither.of(createdSession));

            jest.spyOn(sharedValidators, "requireExistence");
            jest.spyOn(helpers, "mapSession");
            jest.spyOn(helpers, "selectField");

            const service = loginService(userRepository, sessionRepository, tokenService, passwordService);
            const result = await service(loginData).run();

            expect(getUserByUsernameService).toHaveBeenCalledWith(userRepository);
            expect(sharedValidators.requireExistence).toHaveBeenCalledWith(user);
            expect(passwordService.compare).toHaveBeenCalledWith(loginData.password);
            expect(tokenService.generateToken).toHaveBeenCalledWith(user);
            expect(helpers.mapSession).toHaveBeenCalledWith({ token, userId: user._id });
            expect(createSessionService).toHaveBeenCalledWith(sessionRepository);
            expect(helpers.selectField).toHaveBeenCalledWith("token");
            expect(result.isRight()).toBe(true);
            expect(result.value).toBe(token);
        });

        test("fails if user not found", async () => {
            const loginData = {
                username: "camila",
                password: "password123"
            };
            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(null));
            jest.spyOn(sharedValidators, "requireExistence");

            const passwordService = { 
                compare: jest.fn()
            };

            const tokenService = {
                generateToken: jest.fn()
            };
            const service = loginService({}, {}, tokenService, passwordService);
            const result = await service(loginData).run();
            expect(sharedValidators.requireExistence).toHaveBeenCalledWith(null);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });

        test("fails if password comparison fails", async () => {
            const loginData = {
                username: "joaquin",
                password: "password1234"
            };
            const user = {
                username: "joaquin",
                password: "hash"
            };
            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            const passwordService = {
                compare: jest.fn(() => () => AsyncEither.fromEither(Either.left("Invalid credentials")))
            };
            const tokenService = {
                generateToken: jest.fn()
            };

            const service = loginService({}, {}, tokenService, passwordService);
            const result = await service(loginData).run();
            expect(passwordService.compare).toHaveBeenCalledWith(loginData.password);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Invalid credentials");
        });

        test("fails if token generation fails", async () => {
            const loginData = {
                username: "joaquin",
                password: "password123"
            };
            const user = {
                _id: "123",
                username: "joaquin"
            };
            getUserByUsernameService.mockReturnValue(() => AsyncEither.of(user));
            const passwordService = {
                compare: jest.fn(()=> ()=> AsyncEither.of(user))
            };
            const tokenService = {
                generateToken: jest.fn(()=> AsyncEither.fromEither(Either.left("Token error")))
            };
            const service = loginService({}, {}, tokenService, passwordService);
            const result = await service(loginData).run();
            expect(tokenService.generateToken).toHaveBeenCalledWith(user);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Token error");
        });
    });

    describe("logoutService", () => {
        test("revokes session successfully", async () => {
            const data = {
                token: "validToken"
            };
            const session = {
                _id: "789",
                token: "validToken",
                userId: "666",
                revoked: false
            };
            const updatedSession = {
                ...session,
                revoked: true
            };

            const sessionRepository = {};
            const tokenService = {
                verifyToken: jest.fn()
            };

            getSessionByTokenService.mockReturnValue(() => AsyncEither.of(session));
            tokenService.verifyToken.mockReturnValue(AsyncEither.of(session));
            partiallyUpdateSessionByTokenService.mockReturnValue(() => AsyncEither.of(updatedSession));

            jest.spyOn(sharedValidators, "requireExistence");
            jest.spyOn(helpers, "updateField");
            jest.spyOn(helpers, "pickRequiredFields");

            const service = logoutService(sessionRepository, tokenService);
            const result = await service(data).run();

            expect(getSessionByTokenService).toHaveBeenCalledWith(sessionRepository);
            expect(tokenService.verifyToken).toHaveBeenCalledWith(session);
            expect(sharedValidators.requireExistence).toHaveBeenCalledWith(session);
            expect(helpers.updateField).toHaveBeenCalledWith("revoked", true);
            expect(helpers.pickRequiredFields).toHaveBeenCalled();
            expect(partiallyUpdateSessionByTokenService).toHaveBeenCalledWith(sessionRepository);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(updatedSession);
        });

        test("fails if session not found", async () => {
            const data = {
                token: "invalidToken"
            };
            getSessionByTokenService.mockReturnValue(() => AsyncEither.fromEither(Either.left("Not found")));
            const tokenService = {
                verifyToken: jest.fn()
            };

            const service = logoutService({}, tokenService);
            const result = await service(data).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });

        test("fails if token verification fails", async () => {
            const data = {
                token: "invalidToken"
            };
            const session = {
                token: "invalidToken"
            };
            getSessionByTokenService.mockReturnValue(() => AsyncEither.of(session));
            const tokenService = { verifyToken: jest.fn(() => AsyncEither.fromEither(Either.left("Invalid token"))) };

            const service = logoutService({}, tokenService);
            const result = await service(data).run();

            expect(tokenService.verifyToken).toHaveBeenCalledWith(session);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Invalid token");
        });
    });

    describe("checkUsernameNotExists", () => {
        test("returns data if username does not exist", async () => {
            const data = {username: "joaquin"};
            const userRepository = {
                doesNotExistByUsername: jest.fn()
            };
            userRepository.doesNotExistByUsername.mockReturnValue(AsyncEither.of(null));
            jest.spyOn(sharedValidators, "rejectIfExists");
            jest.spyOn(sharedValidators, "recover");
            const check = checkUsernameNotExists(userRepository);
            const result = await check(data).run();

            expect(userRepository.doesNotExistByUsername).toHaveBeenCalledWith(data.username);
            expect(sharedValidators.rejectIfExists).toHaveBeenCalledWith(null);
            expect(sharedValidators.recover).toHaveBeenCalledWith(data);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(data);
        });

        test("fails if username exists", async () => {
            const data = {username: "pancho"};
            const existing = existing;
            const userRepository = {
                doesNotExistByUsername: jest.fn()
            };
            userRepository.doesNotExistByUsername.mockReturnValue(AsyncEither.of(existing));
            jest.spyOn(sharedValidators, "rejectIfExists");
            jest.spyOn(sharedValidators, "recover");
            const check = checkUsernameNotExists(userRepository);
            const result = await check(data).run();
            expect(userRepository.doesNotExistByUsername).toHaveBeenCalledWith(data.username);
            expect(sharedValidators.rejectIfExists).toHaveBeenCalledWith(existing);
        });
    });
    describe("doesNotExistByUsernameService", () => {
        test("returns AsyncEither of null when username does not exist", async () => {
            const userRepository = {
                doesNotExistByUsername: jest.fn()
            };
            const data = {username: "joaquin"};
            userRepository.doesNotExistByUsername.mockReturnValue(AsyncEither.of(null));
            const service = doesNotExistByUsernameService(userRepository);
            const result = await service(data).run();
            expect(userRepository.doesNotExistByUsername).toHaveBeenCalledWith(data.username);
            expect(result.isRight()).toBe(true);
            expect(result.value).toBeNull();
        });

        test("returns AsyncEither of user object when username exists", async () => {
            const userRepository = {
                doesNotExistByUsername: jest.fn()
            };
            const data = {username: "octavio"};
            const existingUser = {username: "octavio", _id: "123"};
            userRepository.doesNotExistByUsername.mockReturnValue(AsyncEither.of(existingUser));
            const service = doesNotExistByUsernameService(userRepository);
            const result = await service(data).run();
            expect(userRepository.doesNotExistByUsername).toHaveBeenCalledWith(data.username);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(existingUser);
        });
    });
});