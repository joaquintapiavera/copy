import {Router} from "express";
import { createScore, getScoreById, partiallyUpdateScoreById, updateScoreById, deleteScoreById } from "../../composition/scoreComposition.js";
import { track } from "../../middlewares/tracker.js";

// All the endpoints from "Score"

const router = Router();
router.post("/", track(createScore));
router.get("/:id", track(getScoreById));
router.put("/:id", track(updateScoreById));
router.patch("/:id",track(partiallyUpdateScoreById));
router.delete("/:id", track(deleteScoreById));

export default router;
