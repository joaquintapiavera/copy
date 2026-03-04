import { createGameController,getGameByIdController,updateGameByIdController,partiallyUpdateGameByIdController,deleteGameByIdController,joinGameController,startGameController, leaveGameController,endGameController,getGameStatusController,getPlayersNamesController,getCurrentPlayerController,getTopCardController,getAllScoresController, dealCardsController, playCardController, drawCardController, sayUnoController, challengePlayerController, handleDrawCardController, handlePlayCardController, getGameHistoryController, getHandByUsernameController, getGameStateController } from "../../../../src/infrastructure/http/controllers/gameController.js";
import { Either } from "../../../../src/shared/monads/Either.js";



afterEach(() => {
    jest.restoreAllMocks();
});

describe("game controller tests", () => {
    let request, response, next;

    beforeEach(() => {
        request = {
            body: {},
            params: {},
            user: { id: "123" }
        };
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    describe("createGameController tests", () => {
        let createGameService;

        beforeEach(() => {
            createGameService = jest.fn();
            request.body = {
                name: "Test Game",
                maxPlayers: 4
            };
        });

        test("creates game successfully", async () => {
            const game = {
                _id: "456",
                userId: "123",
                name: "Test Game",
                maxPlayers: 4,
                status: "waiting",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            createGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(game))
            });

            const controller = createGameController(createGameService);
            await controller(request, response, next);

            expect(createGameService).toHaveBeenCalledWith({
                userId: request.user.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalledWith(game);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Invalid data";
            createGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = createGameController(createGameService);
            await controller(request, response, next);

            expect(createGameService).toHaveBeenCalledWith({
                userId: request.user.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next when service throws an error", async () => {
            const error = new Error("Database error");
            createGameService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = createGameController(createGameService);
            await controller(request, response, next);

            expect(createGameService).toHaveBeenCalledWith({
                userId: request.user.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getGameByIdController", () => {
        let getGameByIdService;

        beforeEach(() => {
            getGameByIdService = jest.fn();
            request.params = { id: "456" };
        });

        test("returns game successfully", async () => {
            const game = {
                _id: "456",
                userId: "123",
                name: "Test Game",
                maxPlayers: 4,
                status: "waiting",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            getGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(game))
            });

            const controller = getGameByIdController(getGameByIdService);
            await controller(request, response, next);

            expect(getGameByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(game);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            getGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getGameByIdController(getGameByIdService);
            await controller(request, response, next);

            expect(getGameByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getGameByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getGameByIdController(getGameByIdService);
            await controller(request, response, next);

            expect(getGameByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("updateGameByIdController", () => {
        let updateGameByIdService;

        beforeEach(() => {
            updateGameByIdService = jest.fn();
            request.params = { id: "456" };
            request.body = {
                name: "Updated Game",
                maxPlayers: 6
            };
        });

        test("updates game successfully", async () => {
            const updatedGame = {
                _id: "456",
                userId: "123",
                name: "Updated Game",
                maxPlayers: 6,
                status: "waiting",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            updateGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedGame))
            });

            const controller = updateGameByIdController(updateGameByIdService);
            await controller(request, response, next);

            expect(updateGameByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedGame);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            updateGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = updateGameByIdController(updateGameByIdService);
            await controller(request, response, next);

            expect(updateGameByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            updateGameByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = updateGameByIdController(updateGameByIdService);
            await controller(request, response, next);

            expect(updateGameByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("partiallyUpdateGameByIdController", () => {
        let partiallyUpdateGameByIdService;

        beforeEach(() => {
            partiallyUpdateGameByIdService = jest.fn();
            request.params = { id: "456" };
            request.body = {
                name: "Partially Updated"
            };
        });

        test("partially updates game successfully", async () => {
            const updatedGame = {
                _id: "456",
                userId: "123",
                name: "Partially Updated",
                maxPlayers: 4,
                status: "waiting",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            partiallyUpdateGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(updatedGame))
            });

            const controller = partiallyUpdateGameByIdController(partiallyUpdateGameByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateGameByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(updatedGame);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            partiallyUpdateGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = partiallyUpdateGameByIdController(partiallyUpdateGameByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateGameByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            partiallyUpdateGameByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = partiallyUpdateGameByIdController(partiallyUpdateGameByIdService);
            await controller(request, response, next);

            expect(partiallyUpdateGameByIdService).toHaveBeenCalledWith({
                id: request.params.id,
                ...request.body
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("deleteGameByIdController", () => {
        let deleteGameByIdService;

        beforeEach(() => {
            deleteGameByIdService = jest.fn();
            request.params = { id: "456" };
        });

        test("deletes game successfully", async () => {
            const deletedGame = {
                _id: "456",
                userId: "123",
                name: "Test Game",
                maxPlayers: 4,
                status: "waiting",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            deleteGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(deletedGame))
            });

            const controller = deleteGameByIdController(deleteGameByIdService);
            await controller(request, response, next);

            expect(deleteGameByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(204);
            expect(response.send).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            deleteGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = deleteGameByIdController(deleteGameByIdService);
            await controller(request, response, next);

            expect(deleteGameByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            deleteGameByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = deleteGameByIdController(deleteGameByIdService);
            await controller(request, response, next);

            expect(deleteGameByIdService).toHaveBeenCalledWith({ id: request.params.id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.send).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("joinGameController", () => {
        let joinGameService;

        beforeEach(() => {
            joinGameService = jest.fn();
            request.body = {
                game_id: "456",
                access_token: "valid-token"
            };
        });

        test("joins game successfully", async () => {
            const result = { message: "User joined the game successfully" };
            joinGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = joinGameController(joinGameService);
            await controller(request, response, next);

            expect(joinGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({ message: "User joined the game successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Unexpected";
            joinGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = joinGameController(joinGameService);
            await controller(request, response, next);

            expect(joinGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            joinGameService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = joinGameController(joinGameService);
            await controller(request, response, next);

            expect(joinGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("startGameController", () => {
        let startGameService;

        beforeEach(() => {
            startGameService = jest.fn();
            request.body = {
                game_id: "456",
                access_token: "valid-token"
            };
        });

        test("starts game successfully", async () => {
            const result = { message: "Game started successfully" };
            startGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = startGameController(startGameService);
            await controller(request, response, next);

            expect(startGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({ message: "Game started successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Unexpected";
            startGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = startGameController(startGameService);
            await controller(request, response, next);

            expect(startGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            startGameService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = startGameController(startGameService);
            await controller(request, response, next);

            expect(startGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("leaveGameController", () => {
        let leaveGameService;

        beforeEach(() => {
            leaveGameService = jest.fn();
            request.body = {
                game_id: "456",
                access_token: "valid-token"
            };
        });

        test("leaves game successfully", async () => {
            const result = { message: "User left the game successfully" };
            leaveGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = leaveGameController(leaveGameService);
            await controller(request, response, next);

            expect(leaveGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({ message: "User left the game successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Unexpected";
            leaveGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = leaveGameController(leaveGameService);
            await controller(request, response, next);

            expect(leaveGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            leaveGameService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = leaveGameController(leaveGameService);
            await controller(request, response, next);

            expect(leaveGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("endGameController", () => {
        let endGameService;

        beforeEach(() => {
            endGameService = jest.fn();
            request.body = {
                game_id: "456",
                access_token: "valid-token"
            };
        });

        test("ends game successfully", async () => {
            const result = { message: "Game ended successfully" };
            endGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = endGameController(endGameService);
            await controller(request, response, next);

            expect(endGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({ message: "Game ended successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Unexpected";
            endGameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = endGameController(endGameService);
            await controller(request, response, next);

            expect(endGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            endGameService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = endGameController(endGameService);
            await controller(request, response, next);

            expect(endGameService).toHaveBeenCalledWith({
                gameId: request.body.game_id,
                token: request.body.access_token
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getGameStatusController", () => {
        let getGameByIdService;

        beforeEach(() => {
            getGameByIdService = jest.fn();
            request.body = {
                game_id: "456"
            };
        });

        test("returns game status successfully", async () => {
            const game = {
                _id: "456",
                status: "in_progress"
            };

            getGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(game))
            });

            const controller = getGameStatusController(getGameByIdService);
            await controller(request, response, next);

            expect(getGameByIdService).toHaveBeenCalledWith({ id: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                game_id: request.body.game_id,
                status: "in_progress"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            getGameByIdService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getGameStatusController(getGameByIdService);
            await controller(request, response, next);

            expect(getGameByIdService).toHaveBeenCalledWith({ id: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getGameByIdService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getGameStatusController(getGameByIdService);
            await controller(request, response, next);

            expect(getGameByIdService).toHaveBeenCalledWith({ id: request.body.game_id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getPlayersNamesController", () => {
        let getPlayersNamesService;

        beforeEach(() => {
            getPlayersNamesService = jest.fn();
            request.body = {
                game_id: "456"
            };
        });

        test("returns players names successfully", async () => {
            const players = ["Alice", "Bob", "Charlie"];
            getPlayersNamesService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(players))
            });

            const controller = getPlayersNamesController(getPlayersNamesService);
            await controller(request, response, next);

            expect(getPlayersNamesService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                game_id: request.body.game_id,
                players: players
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            getPlayersNamesService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getPlayersNamesController(getPlayersNamesService);
            await controller(request, response, next);

            expect(getPlayersNamesService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getPlayersNamesService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getPlayersNamesController(getPlayersNamesService);
            await controller(request, response, next);

            expect(getPlayersNamesService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getCurrentPlayerController", () => {
        let getCurrentPlayerService;

        beforeEach(() => {
            getCurrentPlayerService = jest.fn();
            request.body = {
                game_id: "456"
            };
        });

        test("returns current player successfully", async () => {
            const player = { username: "Alice" };
            getCurrentPlayerService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(player))
            });

            const controller = getCurrentPlayerController(getCurrentPlayerService);
            await controller(request, response, next);

            expect(getCurrentPlayerService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                game_id: request.body.game_id,
                current_player: "Alice"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            getCurrentPlayerService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getCurrentPlayerController(getCurrentPlayerService);
            await controller(request, response, next);

            expect(getCurrentPlayerService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getCurrentPlayerService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getCurrentPlayerController(getCurrentPlayerService);
            await controller(request, response, next);

            expect(getCurrentPlayerService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getTopCardController", () => {
        let getTopCardService;

        beforeEach(() => {
            getTopCardService = jest.fn();
            request.body = {
                game_id: "456"
            };
        });

        test("returns top card successfully", async () => {
            const card = {
                color: "RED",
                type: "number",
                value: 5
            };
            getTopCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(card))
            });

            const controller = getTopCardController(getTopCardService);
            await controller(request, response, next);

            expect(getTopCardService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                game_id: request.body.game_id,
                top_card: "RED of number with value 5"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            getTopCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getTopCardController(getTopCardService);
            await controller(request, response, next);

            expect(getTopCardService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getTopCardService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getTopCardController(getTopCardService);
            await controller(request, response, next);

            expect(getTopCardService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getAllScoresController", () => {
        let getAllScoresService;

        beforeEach(() => {
            getAllScoresService = jest.fn();
            request.body = {
                game_id: "456"
            };
        });

        test("returns all scores successfully", async () => {
            const scores = [
                { player: "Alice", score: 10 },
                { player: "Bob", score: 20 }
            ];
            getAllScoresService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(scores))
            });

            const controller = getAllScoresController(getAllScoresService);
            await controller(request, response, next);

            expect(getAllScoresService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                game_id: request.body.game_id,
                scores: scores
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 404 when game not found", async () => {
            const error = "Not found";
            getAllScoresService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getAllScoresController(getAllScoresService);
            await controller(request, response, next);
            expect(getAllScoresService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getAllScoresService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getAllScoresController(getAllScoresService);
            await controller(request, response, next);
            expect(getAllScoresService).toHaveBeenCalledWith({ gameId: request.body.game_id });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });
    describe("dealCardsController", () => {
        let dealCardsService;

        beforeEach(() => {
            dealCardsService = jest.fn();
            request.body = {
                players: ["Joaquin", "Juan"],
                cardsPerPlayer: 5
            };
        });

        test("deals cards successfully", async () => {
            const result = {
                players: [
                    { username: "Joaquin", hand: ["123", "456", "789", "101", "112"] },
                    { username: "Juan", hand: ["131", "415", "161", "718", "192"] }
                ]
            };
            dealCardsService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = dealCardsController(dealCardsService);
            await controller(request, response, next);

            expect(dealCardsService).toHaveBeenCalledWith({
                players: request.body.players,
                cardsPerPlayer: request.body.cardsPerPlayer
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                message: "Cards dealt successfully",
                players: result
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Deal error";
            dealCardsService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = dealCardsController(dealCardsService);
            await controller(request, response, next);

            expect(dealCardsService).toHaveBeenCalledWith({
                players: request.body.players,
                cardsPerPlayer: request.body.cardsPerPlayer
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ error: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            dealCardsService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });
            const controller = dealCardsController(dealCardsService);
            await controller(request, response, next);

            expect(dealCardsService).toHaveBeenCalledWith({
                players: request.body.players,
                cardsPerPlayer: request.body.cardsPerPlayer
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("playCardController", () => {
        let playCardService;

        beforeEach(() => {
            playCardService = jest.fn();
            request.body = {
                player: "Joaquin",
                cardPlayed: "RED 5"
            };
        });

        test("plays card successfully", async () => {
            const result = { nextPlayer: "Juan" };
            playCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = playCardController(playCardService);
            await controller(request, response, next);

            expect(playCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                cardPlayed: "RED 5"
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                message: "Card played successfully",
                nextPlayer: "Juan"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Invalid card. Please play a card that matches the top card on the discard pile.";
            playCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = playCardController(playCardService);
            await controller(request, response, next);

            expect(playCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                cardPlayed: "RED 5"
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({
                message: "Invalid card. Please play a card that matches the top card on the discard pile."
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            playCardService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = playCardController(playCardService);
            await controller(request, response, next);

            expect(playCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                cardPlayed: "RED 5"
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("drawCardController", () => {
        let drawCardService;

        beforeEach(() => {
            drawCardService = jest.fn();
            request.body = {
                player: "Joaquin"
            };
        });

        test("draws card successfully", async () => {
            const result = {
                drawnCard: { color: "BLUE", value: 7, type: "NUMBER" }
            };
            drawCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = drawCardController(drawCardService);
            await controller(request, response, next);

            expect(drawCardService).toHaveBeenCalledWith({ player: "Joaquin" });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                message: "Joaquin drew a card from the deck.",
                cardDrawn: "BLUE 7 NUMBER"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Draw error";
            drawCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = drawCardController(drawCardService);
            await controller(request, response, next);

            expect(drawCardService).toHaveBeenCalledWith({ player: "Joaquin" });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            drawCardService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = drawCardController(drawCardService);
            await controller(request, response, next);

            expect(drawCardService).toHaveBeenCalledWith({ player: "Joaquin" });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("sayUnoController", () => {
        let sayUnoService;

        beforeEach(() => {
            sayUnoService = jest.fn();
            request.body = {
                player: "Joaquin",
                action: "say_uno"
            };
        });

        test("says uno successfully", async () => {
            const result = { saidUno: true };
            sayUnoService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = sayUnoController(sayUnoService);
            await controller(request, response, next);

            expect(sayUnoService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "say_uno"
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                message: "Joaquin said UNO successfully"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Cannot say UNO";
            sayUnoService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = sayUnoController(sayUnoService);
            await controller(request, response, next);

            expect(sayUnoService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "say_uno"
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            sayUnoService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = sayUnoController(sayUnoService);
            await controller(request, response, next);

            expect(sayUnoService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "say_uno"
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("challengePlayerController", () => {
        let challengePlayerService;

        beforeEach(() => {
            challengePlayerService = jest.fn();
            request.body = {
                challenger: "Joaquin",
                challengedPlayer: "Juan"
            };
        });

        test("challenges successfully", async () => {
            const result = { nextPlayer: "Pedro" };
            challengePlayerService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = challengePlayerController(challengePlayerService);
            await controller(request, response, next);

            expect(challengePlayerService).toHaveBeenCalledWith({
                challenger: "Joaquin",
                challengedPlayer: "Juan"
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                message: "Challenge successful. Juan forgot to say UNO and draws 2 cards.",
                nextPlayer: "Pedro"
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Challenge failed";
            challengePlayerService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = challengePlayerController(challengePlayerService);
            await controller(request, response, next);

            expect(challengePlayerService).toHaveBeenCalledWith({
                challenger: "Joaquin",
                challengedPlayer: "Juan"
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            challengePlayerService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = challengePlayerController(challengePlayerService);
            await controller(request, response, next);

            expect(challengePlayerService).toHaveBeenCalledWith({
                challenger: "Joaquin",
                challengedPlayer: "Juan"
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("handleDrawCardController", () => {
        let handleDrawCardService;

        beforeEach(() => {
            handleDrawCardService = jest.fn();
            request.body = {
                player: "Joaquin",
                action: "draw"
            };
        });

        test("handles draw card successfully", async () => {
            const result = { message: "Joaquin drew a card" };
            handleDrawCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = handleDrawCardController(handleDrawCardService);
            await controller(request, response, next);

            expect(handleDrawCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "draw"
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(result);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Draw error";
            handleDrawCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = handleDrawCardController(handleDrawCardService);
            await controller(request, response, next);

            expect(handleDrawCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "draw"
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            handleDrawCardService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = handleDrawCardController(handleDrawCardService);
            await controller(request, response, next);

            expect(handleDrawCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "draw"
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("handlePlayCardController", () => {
        let handlePlayCardService;

        beforeEach(() => {
            handlePlayCardService = jest.fn();
            request.body = {
                player: "Joaquin",
                action: "play",
                card: "RED 5"
            };
        });

        test("handles play card successfully", async () => {
            const result = { history: ["Joaquin played RED 5"] };
            handlePlayCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(result))
            });

            const controller = handlePlayCardController(handlePlayCardService);
            await controller(request, response, next);

            expect(handlePlayCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "play",
                cardPlayed: "RED 5"
            });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(result);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Play error";
            handlePlayCardService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = handlePlayCardController(handlePlayCardService);
            await controller(request, response, next);

            expect(handlePlayCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "play",
                cardPlayed: "RED 5"
            });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            handlePlayCardService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = handlePlayCardController(handlePlayCardService);
            await controller(request, response, next);

            expect(handlePlayCardService).toHaveBeenCalledWith({
                player: "Joaquin",
                action: "play",
                cardPlayed: "RED 5"
            });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getGameHistoryController", () => {
        let getGameHistoryService;

        beforeEach(() => {
            getGameHistoryService = jest.fn();
            request.body = {
                game_id: "456"
            };
        });

        test("returns game history successfully", async () => {
            const history = ["Joaquin played RED 5", "Juan drew a card"];
            getGameHistoryService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(history))
            });

            const controller = getGameHistoryController(getGameHistoryService);
            await controller(request, response, next);

            expect(getGameHistoryService).toHaveBeenCalledWith({ gameId: "456" });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(history);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Game not found";
            getGameHistoryService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getGameHistoryController(getGameHistoryService);
            await controller(request, response, next);

            expect(getGameHistoryService).toHaveBeenCalledWith({ gameId: "456" });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getGameHistoryService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getGameHistoryController(getGameHistoryService);
            await controller(request, response, next);

            expect(getGameHistoryService).toHaveBeenCalledWith({ gameId: "456" });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getHandByUsernameController", () => {
        let getHandByUsernameService;

        beforeEach(() => {
            getHandByUsernameService = jest.fn();
            request.body = {
                player: "Joaquin"
            };
        });

        test("returns hand successfully", async () => {
            const hand = ["RED 5", "BLUE SKIP"];
            getHandByUsernameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(hand))
            });

            const controller = getHandByUsernameController(getHandByUsernameService);
            await controller(request, response, next);

            expect(getHandByUsernameService).toHaveBeenCalledWith({ player: "Joaquin" });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                player: "Joaquin",
                hand: hand
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Player not found";
            getHandByUsernameService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getHandByUsernameController(getHandByUsernameService);
            await controller(request, response, next);

            expect(getHandByUsernameService).toHaveBeenCalledWith({ player: "Joaquin" });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getHandByUsernameService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getHandByUsernameController(getHandByUsernameService);
            await controller(request, response, next);

            expect(getHandByUsernameService).toHaveBeenCalledWith({ player: "Joaquin" });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });

    describe("getGameStateController", () => {
        let getGameStateService;

        beforeEach(() => {
            getGameStateService = jest.fn();
            request.body = {
                game_id: "456"
            };
        });

        test("returns game state successfully", async () => {
            const state = {
                currentPlayer: "Joaquin",
                topCard: "RED 5",
                hands: { Joaquin: ["BLUE 7"], Juan: ["YELLOW SKIP"] },
                turnHistory: ["Joaquin played RED 5"]
            };
            getGameStateService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.right(state))
            });

            const controller = getGameStateController(getGameStateService);
            await controller(request, response, next);

            expect(getGameStateService).toHaveBeenCalledWith({ gameId: "456" });
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith(state);
            expect(next).not.toHaveBeenCalled();
        });

        test("returns 400 when service returns left", async () => {
            const error = "Game not found";
            getGameStateService.mockReturnValue({
                run: jest.fn().mockResolvedValue(Either.left(error))
            });

            const controller = getGameStateController(getGameStateService);
            await controller(request, response, next);

            expect(getGameStateService).toHaveBeenCalledWith({ gameId: "456" });
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({ message: error });
            expect(next).not.toHaveBeenCalled();
        });

        test("calls next on unexpected error", async () => {
            const error = new Error("Unexpected");
            getGameStateService.mockReturnValue({
                run: jest.fn().mockRejectedValue(error)
            });

            const controller = getGameStateController(getGameStateService);
            await controller(request, response, next);

            expect(getGameStateService).toHaveBeenCalledWith({ gameId: "456" });
            expect(next).toHaveBeenCalledWith(error);
            expect(response.status).not.toHaveBeenCalled();
            expect(response.json).not.toHaveBeenCalled();
        });
    });
});