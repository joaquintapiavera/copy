import mongoose from "mongoose";

const endPointTrackSchema = new mongoose.Schema({
    _id: { type: String},
    endpointAccess: { type: String},
    requestMethod: { type: String},
    statusCode: { type: Number},
    responseTime: { type: Number},
    timestamp: { type: Date},
    userId: { type: String},
    createdAt: { type: Date}
});


const MongoEndPointTrack = mongoose.model("EndPointTrack", endPointTrackSchema);

export default MongoEndPointTrack;