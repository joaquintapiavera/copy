import { createScoreService, deleteScoreByIdService, getScoreByIdService, partiallyUpdateScoreByIdService, updateScoreByIdService } from "../../application/services/scoreService.js";
import { createScoreController, deleteScoreByIdController, getScoreByIdController, partiallyUpdateScoreByIdController, updateScoreByIdController } from "../../infrastructure/http/controllers/scoreController.js";
import ScoreRepository from "../../infrastructure/repository/scoreRepository.js";

const scoreRepository = new ScoreRepository();
const createScoreFunctionality = createScoreService(scoreRepository);
const getScoreFunctionality = getScoreByIdService(scoreRepository);
const updateScoreFunctionality = updateScoreByIdService(scoreRepository);
const partiallyUpdateScoreFunctionality = partiallyUpdateScoreByIdService(scoreRepository);
const deleteScoreFunctionality = deleteScoreByIdService(scoreRepository);

export const createScore = createScoreController(createScoreFunctionality);
export const getScoreById = getScoreByIdController(getScoreFunctionality);
export const updateScoreById = updateScoreByIdController(updateScoreFunctionality); 
export const partiallyUpdateScoreById = partiallyUpdateScoreByIdController(partiallyUpdateScoreFunctionality);
export const deleteScoreById = deleteScoreByIdController(deleteScoreFunctionality);
