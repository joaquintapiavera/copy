import mongoose from "mongoose";

// The schema of a Card.  We use required: true if the property is mandatory, and basic validation
const scoreSchema = new mongoose.Schema({
    _id: { type: String},
    userId: { type: String},
    gameId: { type: String},
    value: { type: Number},
    createdAt: { type: Date}
});

// Creates the "Score" model based on the schema using Mongoose
const MongoScore = mongoose.model("Score", scoreSchema);

export default MongoScore;