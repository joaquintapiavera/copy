import { challengePlayerService, createGameService, dealCardsService, deleteGameByIdService, drawCardService, endGameService, getAllScoresService, getCurrentPlayerService, getGameByIdService, getGameHistoryService, getGameStateService, getHandByUsernameService,  getNextPlayerService,  getPlayersNamesService, getTopCardService, handleDrawCardService, handlePlayCardService, joinGameService, leaveGameService, partiallyUpdateGameByIdService, playCardService, sayUnoService, startGameService, updateGameByIdService } from "../../application/services/gameService.js";
import { challengePlayerController, createGameController, dealCardsController, deleteGameByIdController, drawCardController, endGameController, getAllScoresController, getCurrentPlayerController, getGameByIdController, getGameHistoryController, getGameStateController, getGameStatusController, getHandByUsernameController, getNextPlayerController, getPlayersNamesController, getTopCardController, handleDrawCardController, handlePlayCardController, joinGameController, leaveGameController, partiallyUpdateGameByIdController, playCardController, sayUnoController, startGameController, updateGameByIdController } from "../../infrastructure/http/controllers/gameController.js";
import CardRepository from "../../infrastructure/repository/cardRepository.js";
import GameRepository from "../../infrastructure/repository/gameRepository.js";
import ScoreRepository from "../../infrastructure/repository/scoreRepository.js";
import SessionRepository from "../../infrastructure/repository/sessionRepository.js";
import UserRepository from "../../infrastructure/repository/userRepository.js";
import { JWT } from "../../infrastructure/security/JWT.js";

const gameRepository = new GameRepository();
const cardRepository = new CardRepository();
const sessionRepository = new SessionRepository();
const userRepository = new UserRepository();
const tokenService = new JWT();
const scoreRepository = new ScoreRepository();

const createGameFunctionality = createGameService(gameRepository, cardRepository);
const getGameFunctionality = getGameByIdService(gameRepository);
const updateGameFunctionality = updateGameByIdService(gameRepository);
const partiallyUpdateGameFunctionality = partiallyUpdateGameByIdService(gameRepository);
const deleteGameFunctionality = deleteGameByIdService(gameRepository);
export const joinGameFunctionality = joinGameService(gameRepository, userRepository, tokenService);
export const startGameFunctionality = startGameService(gameRepository, userRepository, tokenService);
export const leaveGameFunctionality = leaveGameService(gameRepository, userRepository, tokenService);
export const endGameFunctionality = endGameService(gameRepository, userRepository, tokenService);
const getPlayersNamesFunctionality = getPlayersNamesService(userRepository, gameRepository);
const getCurrentPlayerFunctionality = getCurrentPlayerService(userRepository, gameRepository);
const getTopCardFunctionality = getTopCardService(gameRepository, cardRepository);
const getAllScoresFunctionality = getAllScoresService(gameRepository, userRepository, scoreRepository);
const dealCardsFunctionality = dealCardsService(userRepository, cardRepository);
const playCardFunctionality = playCardService(gameRepository, userRepository, cardRepository);
const drawCardFunctionality = drawCardService(gameRepository, userRepository, cardRepository);
export const sayUnoFunctionality = sayUnoService(userRepository)
export const challengePlayerFunctionality = challengePlayerService(gameRepository, userRepository, cardRepository)
export const handleDrawCardFunctionality = handleDrawCardService(gameRepository, userRepository, cardRepository)
export const handlePlayCardFunctionality = handlePlayCardService(gameRepository, userRepository, cardRepository, scoreRepository)
const getGameHistoryFunctionality = getGameHistoryService(gameRepository)
const getHandByUsernameFunctionality = getHandByUsernameService(cardRepository, userRepository)
const getGameStateFunctionality = getGameStateService(gameRepository, userRepository, cardRepository)
const getNextPlayerFunctionality = getNextPlayerService(gameRepository, userRepository)

export const createGame = createGameController(createGameFunctionality);
export const getGameById = getGameByIdController(getGameFunctionality);
export const updateGameById = updateGameByIdController(updateGameFunctionality); 
export const partiallyUpdateGameById = partiallyUpdateGameByIdController(partiallyUpdateGameFunctionality);
export const deleteGameById = deleteGameByIdController(deleteGameFunctionality);
export const joinGame = joinGameController(joinGameFunctionality);
export const startGame = startGameController(startGameFunctionality);
export const leaveGame = leaveGameController(leaveGameFunctionality);
export const endGame = endGameController(endGameFunctionality);
export const getGameStatus = getGameStatusController(getGameFunctionality);
export const getPlayersNames = getPlayersNamesController(getPlayersNamesFunctionality);
export const getCurrentPlayer = getCurrentPlayerController(getCurrentPlayerFunctionality);
export const getTopCard = getTopCardController(getTopCardFunctionality);
export const getAllScores = getAllScoresController(getAllScoresFunctionality);
export const dealCards = dealCardsController(dealCardsFunctionality);
export const playCard = playCardController(playCardFunctionality)
export const drawCard = drawCardController(drawCardFunctionality);
export const sayUno = sayUnoController(sayUnoFunctionality);
export const challengePlayer = challengePlayerController(challengePlayerFunctionality)
export const handleDrawCard = handleDrawCardController(handleDrawCardFunctionality)
export const handlePlayCard = handlePlayCardController(handlePlayCardFunctionality)
export const getGameHistory = getGameHistoryController(getGameHistoryFunctionality)
export const getHandByUsername = getHandByUsernameController(getHandByUsernameFunctionality)
export const getGameState = getGameStateController(getGameStateFunctionality)
export const getNextPlayer = getNextPlayerController(getNextPlayerFunctionality)