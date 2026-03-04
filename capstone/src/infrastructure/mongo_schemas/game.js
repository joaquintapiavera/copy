import mongoose from "mongoose";

// The schema of the Game.  We use required: true if the property is mandatory, and basic validation
const gameSchema = new mongoose.Schema({
    _id: { type: String},
    name: { type: String },
    rules: {type: String },
    status: {type: String, enum: ['WAITING', 'IN_PROGRESS', 'FINISHED'] },
    maxPlayers: {type: Number },
    creatorId: {type: String },
    playersIds: [{ type: String, ref: 'Player' }],
    turnIndex: {type: Number },
    topCard: { type: String, ref: 'Card' },
    history: {type: Array},
    createdAt: {type: Date},
    clockwise: {type: Boolean}
});


// Creates the "Game" model based on the schema using Mongoose
const MongoGame = mongoose.model("Game", gameSchema);

export default MongoGame;