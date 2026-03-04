import { Router } from "express";
import { getPopularEndpoints, getRequestsStats, getResponseTimes, getStatusCodes } from "../../composition/endPointTrackComposition.js";


const router = Router();
router.get("/requests", getRequestsStats)
router.get("/response-times",getResponseTimes)
router.get("/status-codes", getStatusCodes)
router.get("/popular-endpoints", getPopularEndpoints)

export default router;
