import {Router} from "express";
import { createUser, getUserById, partiallyUpdateUserById, updateUserById, deleteUserById, getUserByToken } from "../../composition/userComposition.js";
import { track } from "../../middlewares/tracker.js";

// All the endpoints from "User"

const router = Router();
router.post("/", track(createUser));
router.get("/:id", track(getUserById));
router.put("/:id", track(updateUserById));
router.patch("/:id",track(partiallyUpdateUserById));
router.delete("/:id", track(deleteUserById));
router.post("/profile", track(getUserByToken));

export default router;
