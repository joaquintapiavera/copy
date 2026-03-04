import mongoose from "mongoose";

// The schema of a User. We use required: true if the property is mandatory, and basic validation
const userSchema = new mongoose.Schema({
    _id: { type: String},
    username: { type: String},
    email: { type: String},
    password: { type: String},
    isReady: { type: Boolean},
    saidUno: { type: Boolean},
    hand: [{ type: String, ref: 'Card' }],
    score: { type: Number},
    createdAt: { type: Date}
});

// Creates the "User" model based on the schema using Mongoose
const MongoUser = mongoose.model("User", userSchema);

export default MongoUser;