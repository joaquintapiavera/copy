import { createUserController, getUserByIdController, updateUserByIdController, partiallyUpdateUserByIdController, deleteUserByIdController, getUserByTokenController} from "../../../../src/infrastructure/http/controllers/userController";
import { Either } from "../../../../src/shared/monads/Either";


afterEach(() => {
    jest.restoreAllMocks();
});

describe("user controller tests", () => {
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

    describe("createUserController tests", () => {
        let createUserService;

        beforeEach(() => {
            createUserService = jest.fn();
            request.body = {
                username: "joaquin",
                email: "joaquin@gmail.com",
                password: "password123"
            };
        });

        test("creates user successfully", async () => {
            const user = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@gmail.com",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            createUserService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(user))
            });

            const controller = createUserController(createUserService);
            await controller(request, response, next);
            expect(createUserService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith(user);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Already exists";
            createUserService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });
            const controller = createUserController(createUserService);
            await controller(request, response, next);

            expect(createUserService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next when service throws an error", async () => {
            const error = new Error("Database error");
            createUserService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = createUserController(createUserService);
            await controller(request, response, next);

            expect(createUserService).toHaveBeenCalledWith(request.body);
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getUserByIdController tests", () => {
        let getUserByIdService;

        beforeEach(() => {
            getUserByIdService = jest.fn();
            request.params = { id: "123" };
        });

        test("returns user successfully", async () => {
            const user = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@gmail.com",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            getUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(user))
            });

            const controller = getUserByIdController(getUserByIdService);
            await controller(request, response, next);

            expect(getUserByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(user);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when user not found", async () => {
            const error = "Not found";
            getUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });
            const controller = getUserByIdController(getUserByIdService);
            await controller(request, response, next);
            expect(getUserByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getUserByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getUserByIdController(getUserByIdService);
            await controller(request, response, next);
            expect(getUserByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("updateUserByIdController tests ", () => {
        let updateUserByIdService;

        beforeEach(() => {
            updateUserByIdService = jest.fn();
            request.params = { id: "123" };
            request.body = {
                username: "octavio",
                email: "octavio@gmail.com"
            };
        });

        test("updates user successfully", async () => {
            const updatedUser = {
                _id: "123",
                username: "octavio",
                email: "octavio@gmail.com",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            updateUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedUser))
            });

            const controller = updateUserByIdController(updateUserByIdService);
            await controller(request, response, next);

            expect(updateUserByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedUser);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when user not found", async () => {
            const error = "Not found";
            updateUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = updateUserByIdController(updateUserByIdService);
            await controller(request, response, next);

            expect(updateUserByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            updateUserByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = updateUserByIdController(updateUserByIdService);
            await controller(request, response, next);

            expect(updateUserByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("partiallyUpdateUserByIdController test", () => {
        let partiallyUpdateUserByIdService;

        beforeEach(() => {
            partiallyUpdateUserByIdService = jest.fn();
            request.params = { id: "123" };
            request.body = {
                username: "octavio"
            };
        });

        test("partially updates user successfully ", async () => {
            const updatedUser = {
                _id: "123",
                username: "octavio",
                email: "joaquin@gmail.com",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            partiallyUpdateUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedUser))
            });
            const controller = partiallyUpdateUserByIdController(partiallyUpdateUserByIdService);
            await controller(request, response, next);
            expect(partiallyUpdateUserByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedUser);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when user not found", async () => {
            const error = "Not found";
            partiallyUpdateUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = partiallyUpdateUserByIdController(partiallyUpdateUserByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateUserByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            partiallyUpdateUserByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = partiallyUpdateUserByIdController(partiallyUpdateUserByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateUserByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("deleteUserByIdController test", () => {
        let deleteUserByIdService;

        beforeEach(() => {
            deleteUserByIdService = jest.fn();
            request.params = { id: "123" };
        });

        test("deletes user successfully", async () => {
            const deletedUser = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@gmail.com",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            deleteUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(deletedUser))
            });

            const controller = deleteUserByIdController(deleteUserByIdService);
            await controller(request, response, next);

            expect(deleteUserByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(204);
            expect(response.send).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when user not found", async () => {
            const error = "Not found";
            deleteUserByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = deleteUserByIdController(deleteUserByIdService);
            await controller(request, response, next);

            expect(deleteUserByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            deleteUserByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = deleteUserByIdController(deleteUserByIdService);
            await controller(request, response, next);

            expect(deleteUserByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.send).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getUserByTokenController tests", () => {
        let getUserByTokenService;

        beforeEach(() => {
            getUserByTokenService = jest.fn();
            request.body = {
                access_token: "validToken"
            };
        });

        test("returns user successfully by token", async () => {
            const user = {
                _id: "123",
                username: "joaquin",
                email: "joaquin@gmail.com",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            getUserByTokenService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(user))
            });

            const controller = getUserByTokenController(getUserByTokenService);
            await controller(request, response, next);

            expect(getUserByTokenService).toHaveBeenCalledWith({ token: request.body.access_token });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(user);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when token is invalid or user not found", async () => {
            const error = "Not found";
            getUserByTokenService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });
            const controller = getUserByTokenController(getUserByTokenService);
            await controller(request, response, next);

            expect(getUserByTokenService).toHaveBeenCalledWith({ token: request.body.access_token });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error});
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getUserByTokenService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });
            const controller = getUserByTokenController(getUserByTokenService);
            await controller(request, response, next);

            expect(getUserByTokenService).toHaveBeenCalledWith({ token: request.body.access_token });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });
});