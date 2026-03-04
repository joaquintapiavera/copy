import {Router} from "express";
import { createGame, getGameById, partiallyUpdateGameById, updateGameById, deleteGameById, joinGame, startGame, leaveGame, endGame, getGameStatus,  getPlayersNames, getCurrentPlayer, getTopCard, getAllScores, dealCards, playCard, drawCard, sayUno, challengePlayer, handleDrawCard, handlePlayCard, getGameHistory,getHandByUsername, getGameState, getNextPlayer } from "../../composition/gameComposition.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { track } from "../../middlewares/tracker.js";


// All the endpoints from "game"

const router = Router();
router.post("/", authMiddleware, track(createGame));
router.get("/game-history", track(getGameHistory))
router.get("/player-hand", track(getHandByUsername))
router.get("/game-state", track(getGameState))
router.get("/next-turn", track(getNextPlayer))
router.get("/:id",  track(getGameById));
router.put("/draw-card",track(drawCard));
router.put("/play-card", track(playCard));
router.put("/handle-play-card", track(handlePlayCard))
router.put("/:id", track(updateGameById));
router.patch("/say-uno",track(sayUno))
router.patch("/:id",track(partiallyUpdateGameById));
router.delete("/:id", track(deleteGameById));
router.post("/join", track(joinGame));
router.post("/start", track(startGame));
router.post("/leave", track(leaveGame));
router.post("/end", track(endGame));
router.post("/status", track(getGameStatus));
router.post("/players", track(getPlayersNames));
router.post("/current-player", track(getCurrentPlayer));
router.post("/top-card", track(getTopCard));
router.post("/scores", track(getAllScores));
router.post("/deal-cards", track(dealCards));
router.post("/challenge-player", track(challengePlayer));
router.post("/handle-draw-card", track(handleDrawCard))



export default router;
