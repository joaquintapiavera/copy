import {Router} from "express";
import { loginUser, logoutUser, registerUser } from "../../composition/authComposition.js";
import { track } from "../../middlewares/tracker.js";

// All the endpoints from "auth"

const router = Router();
router.post("/register", track(registerUser));
router.post("/login", track(loginUser));
router.post("/logout", track(logoutUser));

export default router;
