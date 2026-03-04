import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    _id: { type: String},
    token: { type: String},
    userId: { type: String},
    expiresAt: { type: Date},
    revoked: { type: Boolean},
    createdAt: { type: Date}
});

// Creates the "Session" model based on the schema using Mongoose
const MongoSession = mongoose.model("Session", sessionSchema);

export default MongoSession;