import { Either } from "../../../../src/shared/monads/Either.js";
import {registerUserController,loginController,logoutController} from "../../../../src/infrastructure/http/controllers/authController.js";

afterEach(() => {
    jest.restoreAllMocks();
});

describe("auth controller tests", () => {
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

    describe("registerUserController tests", () => {
        let registerUserService;

        beforeEach(() => {
            registerUserService = jest.fn();
            request.body = {
                username: "joaquin",
                email: "joaquin@gmail.com",
                password: "password123"
            };
        });

        test("registers user successfully", async () => {
            const registered = {
                _id: "123",
                username: "joaquin"};
            registerUserService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(registered))
            });

            const controller = registerUserController(registerUserService);
            await controller(request, response, next);

            expect(registerUserService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith({ message: "User registered successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Already exists";
            registerUserService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = registerUserController(registerUserService);
            await controller(request, response, next);

            expect(registerUserService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next when service throws an error", async () => {
            const error = new Error("Database error");
            registerUserService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = registerUserController(registerUserService);
            await controller(request, response, next);

            expect(registerUserService).toHaveBeenCalledWith(request.body);
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("loginController tets", () => {
        let loginService;

        beforeEach(() => {
            loginService = jest.fn();
            request.body = {
                username: "testuser",
                password: "plain"
            };
        });

        test("logs in successfully", async () => {
            const accessToken = "validToken";
            loginService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(accessToken))
            });

            const controller = loginController(loginService);
            await controller(request, response, next);

            expect(loginService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({ access_token: accessToken });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Invalid credentials";
            loginService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = loginController(loginService);
            await controller(request, response, next);

            expect(loginService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            loginService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = loginController(loginService);
            await controller(request, response, next);

            expect(loginService).toHaveBeenCalledWith(request.body);
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("logoutController tests", () => {
        let logoutService;

        beforeEach(() => {
            logoutService = jest.fn();
            request.body = {
                access_token: "validToken"
            };
        });

        test("logs out successfully", async () => {
            const logoutResult = {
                _id: "456",
                revoked: true
            };
            logoutService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(logoutResult))
            });

            const controller = logoutController(logoutService);
            await controller(request, response, next);

            expect(logoutService).toHaveBeenCalledWith({ token: request.body.access_token });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({ access_token: "User logged out successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Invalid token";
            logoutService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = logoutController(logoutService);
            await controller(request, response, next);

            expect(logoutService).toHaveBeenCalledWith({ token: request.body.access_token });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            logoutService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = logoutController(logoutService);
            await controller(request, response, next);

            expect(logoutService).toHaveBeenCalledWith({ token: request.body.access_token });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });
});