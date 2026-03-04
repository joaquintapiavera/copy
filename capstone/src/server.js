import dotenv from "dotenv";
import app from "./app.js";
import {connectToDatabase} from "./config/databaseConnection.js";
import http from "http";
import { Server } from "socket.io";
import attachGameSocket from "./infrastructure/sockets/gameSocket.js";

// Using dotenv condiguration
dotenv.config();

// Connecting to the database
await connectToDatabase();

// Reading the PORT of the server from the .env file
const PORT = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: "*",
        methods:  ["GET", "POST"]
    }
})
app.set("io", io)

attachGameSocket(io)

// launches the server in the URL and prints the following message
server.listen(PORT, ()=> {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
