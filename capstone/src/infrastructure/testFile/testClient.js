import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const gameId = "11f5c0f1-0c81-4f41-b460-e8d36fb77559";

socket.on("connect", () => {
    console.log("Connected Host:", socket.id);
    socket.emit("game:join", {
        gameId: gameId,
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyY2Y3NjlmLWE5MjgtNDk2OC05YTg2LTZkNmI2NGJlODAzMCIsInVzZXJuYW1lIjoiSm9hY28xMDAwIiwiaWF0IjoxNzcxNzg0Mzk0LCJleHAiOjE4NTgxODQzOTR9.NAJDL28CURZk_zCvivpWtvEOAZ56iMp-6htG_fekC_Y"
    });
});

socket.on("game:update", (game) => {
    console.log("updated game:", game);
});

socket.on("error", (err) => {
    console.log("Error:", err);
});