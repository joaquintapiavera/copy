import dotenv from "dotenv"
import mongoose from "mongoose"

// using dotenv configuration
dotenv.config();

// Reading all the credentials to connect with the MongoDB Database
const HOST = process.env.MONGO_HOST;
const PORT = process.env.MONGO_PORT;
const DB = process.env.MONGO_DB;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// concatenating the credentials to obtain the URL
const URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${HOST}:${PORT}/${DB}?authSource=admin`;

// Connecting to the database using mongoose
export async function connectToDatabase(){
    try{
        await mongoose.connect(URL);
    } catch(error){
        console.error("Error while connecting to the database:", error.message);
        // If the connection fails, the program ends
        process.exit(1);
    }
}
