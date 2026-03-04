import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Conected player:", socket.id);
    socket.emit("game:join", {
        gameId: "11f5c0f1-0c81-4f41-b460-e8d36fb77559",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNmYTAxYjM1LWYxMTgtNGY4My1hYWUxLTUxNzBjMWUxYzg2ZiIsInVzZXJuYW1lIjoiSm9hY285OTkiLCJpYXQiOjE3NzE3ODM1NTQsImV4cCI6MTg1ODE4MzU1NH0.oiWSoSVESAHaYoX9NA6Kaog6k9hPGJN-qogBimLCSzw"
    });
});

socket.on("game:update", (game) => {
    console.log("updated game:", game);
});

socket.on("error", (error) => {
    console.log("Error:", error);
});