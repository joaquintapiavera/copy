import mongoose from "mongoose";

// The schema of a Card.  We use required: true if the property is mandatory, and basic validation
const cardSchema = new mongoose.Schema({
    _id: { type: String},
    color: { type: String},
    value: { type: Number},
    type: { type: String},
    createdAt: { type: Date}
});

// Creates the "Game" model based on the schema using Mongoose
const MongoCard = mongoose.model("Card", cardSchema);

export default MongoCard;