import { createCardService, deleteCardByIdService, getCardByIdService, partiallyUpdateCardByIdService, updateCardByIdService } from "../../application/services/cardService.js";
import { createCardController, deleteCardByIdController, getCardByIdController, partiallyUpdateCardByIdController, updateCardByIdController } from "../../infrastructure/http/controllers/cardController.js";
import CardRepository from "../../infrastructure/repository/cardRepository.js";

const cardRepository = new CardRepository();
const createCardFunctionality = createCardService(cardRepository);
const getCardFunctionality = getCardByIdService(cardRepository);
const updateCardFunctionality = updateCardByIdService(cardRepository);
const partiallyUpdateCardFunctionality = partiallyUpdateCardByIdService(cardRepository);
const deleteCardFunctionality = deleteCardByIdService(cardRepository);

export const createCard = createCardController(createCardFunctionality);
export const getCardById = getCardByIdController(getCardFunctionality);
export const updateCardById = updateCardByIdController(updateCardFunctionality); 
export const partiallyUpdateCardById = partiallyUpdateCardByIdController(partiallyUpdateCardFunctionality);
export const deleteCardById = deleteCardByIdController(deleteCardFunctionality);
