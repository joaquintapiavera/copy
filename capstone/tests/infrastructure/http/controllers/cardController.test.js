import { Either } from "../../../../src/shared/monads/Either";
import { createCardController, getCardByIdController, updateCardByIdController, partiallyUpdateCardByIdController, deleteCardByIdController } from "../../../../src/infrastructure/http/controllers/cardController";
afterEach(() => {
    jest.restoreAllMocks();
});

describe("card controller tests", () => {
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

    describe("createCardController tets", () => {
        let createCardService;

        beforeEach(() => {
            createCardService = jest.fn();
            request.body = {
                color: "RED",
                value: 5,
                gameId: "123"
            };
        });

        test("creates card successfully", async () => {
            const card = {
                _id: "456",
                color: "RED",
                value: 5,
                type: "NUMBER",
                gameId: "123",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            createCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(card))
            });

            const controller = createCardController(createCardService);
            await controller(request, response, next);
            expect(createCardService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith(card);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "gameId required";
            createCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = createCardController(createCardService);
            await controller(request, response, next);

            expect(createCardService).toHaveBeenCalledWith(request.body);
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next when service throws an error", async () => {
            const error = new Error("Database error");
            createCardService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = createCardController(createCardService);
            await controller(request, response, next);

            expect(createCardService).toHaveBeenCalledWith(request.body);
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getCardByIdController tests", () => {
        let getCardByIdService;

        beforeEach(() => {
            getCardByIdService = jest.fn();
            request.params = { id: "456" };
        });

        test("returns card successfully", async () => {
            const card = {
                _id: "456",
                color: "RED",
                value: 5,
                type: "NUMBER",
                gameId: "123",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            getCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(card))
            });

            const controller = getCardByIdController(getCardByIdService);
            await controller(request, response, next);

            expect(getCardByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(card);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when card not found", async () => {
            const error = "Not found";
            getCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getCardByIdController(getCardByIdService);
            await controller(request, response, next);

            expect(getCardByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getCardByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getCardByIdController(getCardByIdService);
            await controller(request, response, next);

            expect(getCardByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("updateCardByIdController tests", () => {
        let updateCardByIdService;

        beforeEach(() => {
            updateCardByIdService = jest.fn();
            request.params = { id: "456" };
            request.body = {
                color: "BLUE",
                value: -1,
                type: "DRAW_TWO",
                gameId: "game456"
            };
        });

        test("updates card successfully", async () => {
            const updatedCard = {
                _id: "456",
                color: "BLUE",
                value: -1,
                type: "DRAW_TWO",
                gameId: "game456",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            updateCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedCard))
            });

            const controller = updateCardByIdController(updateCardByIdService);
            await controller(request, response, next);

            expect(updateCardByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedCard);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when card not found", async () => {
            const error = "Not found";
            updateCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = updateCardByIdController(updateCardByIdService);
            await controller(request, response, next);

            expect(updateCardByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            updateCardByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = updateCardByIdController(updateCardByIdService);
            await controller(request, response, next);

            expect(updateCardByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("partiallyUpdateCardByIdController tests", () => {
        let partiallyUpdateCardByIdService;

        beforeEach(() => {
            partiallyUpdateCardByIdService = jest.fn();
            request.params = { id: "456" };
            request.body = {
                color: "GREEN"
            };
        });

        test("partially updates card successfully", async () => {
            const updatedCard = {
                _id: "456",
                color: "GREEN",
                value: 5,
                type: "NUMBER",
                gameId: "123",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            partiallyUpdateCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedCard))
            });

            const controller = partiallyUpdateCardByIdController(partiallyUpdateCardByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateCardByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedCard);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when card not found", async () => {
            const error = "Not found";
            partiallyUpdateCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = partiallyUpdateCardByIdController(partiallyUpdateCardByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateCardByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            partiallyUpdateCardByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = partiallyUpdateCardByIdController(partiallyUpdateCardByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateCardByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("deleteCardByIdController", () => {
        let deleteCardByIdService;

        beforeEach(() => {
            deleteCardByIdService = jest.fn();
            request.params = { id: "456" };
        });

        test("deletes card successfully", async () => {
            const deletedCard = {
                _id: "456",
                color: "RED",
                value: 5,
                type: "NUMBER",
                gameId: "123",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            deleteCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(deletedCard))
            });

            const controller = deleteCardByIdController(deleteCardByIdService);
            await controller(request, response, next);

            expect(deleteCardByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(204);
            expect(response.send).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when card not found", async () => {
            const error = "Not found";
            deleteCardByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = deleteCardByIdController(deleteCardByIdService);
            await controller(request, response, next);

            expect(deleteCardByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            deleteCardByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = deleteCardByIdController(deleteCardByIdService);
            await controller(request, response, next);

            expect(deleteCardByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.send).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });
});