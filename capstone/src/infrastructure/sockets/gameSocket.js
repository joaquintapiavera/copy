import { joinGameFunctionality,leaveGameFunctionality,startGameFunctionality,handleDrawCardFunctionality,handlePlayCardFunctionality,sayUnoFunctionality,challengePlayerFunctionality,endGameFunctionality} from "../../infrastructure/composition/gameComposition.js";

export default function attachGameSocket(io) {
    io.on("connection", (socket) => {

        socket.currentGameId = null;

        socket.on("game:join", async (data) => {
            const result = await joinGameFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            const game = result.value;

            socket.currentGameId = data.gameId;
            socket.join(socket.currentGameId);

            io.to(socket.currentGameId).emit("game:update", game);
        });

        socket.on("game:leave", async (data) => {
            const result = await leaveGameFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            const game = result.value;

            socket.leave(socket.currentGameId);
            io.to(socket.currentGameId).emit("game:update", game);

            socket.currentGameId = null;
        });

        socket.on("game:start", async (data) => {
            const result = await startGameFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            io.to(socket.currentGameId).emit("game:update", result.value);
        });

        socket.on("game:play", async (data) => {
            const result = await handlePlayCardFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            io.to(socket.currentGameId).emit("game:update", result.value);
        });

        socket.on("game:draw", async (data) => {
            const result = await handleDrawCardFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            io.to(socket.currentGameId).emit("game:update", result.value);
        });

        socket.on("game:sayUno", async (data) => {
            const result = await sayUnoFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            io.to(socket.currentGameId).emit("game:update", result.value);
        });

        socket.on("game:challenge", async (data) => {
            const result = await challengePlayerFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            io.to(socket.currentGameId).emit("game:update", result.value);
        });

        socket.on("game:end", async (data) => {
            const result = await endGameFunctionality(data).run();

            if (result.isLeft()) {
                socket.emit("error", result.value);
                return;
            }

            io.to(socket.currentGameId).emit("game:update", result.value);
        });

    });
}