import { createCard, getCardById, partiallyUpdateCardById, updateCardById, deleteCardById } from "../../composition/cardComposition.js";
import {Router} from "express";
import { track } from "../../middlewares/tracker.js";

const router = Router();
router.post("/", track(createCard));
router.get("/:id", track(getCardById));
router.put("/:id", track(updateCardById));
router.patch("/:id",track(partiallyUpdateCardById));
router.delete("/:id", track(deleteCardById));

export default router;
