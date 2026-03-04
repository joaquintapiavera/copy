import { createUserService, deleteUserByIdService, getUserByIdService, getUserByTokenService, partiallyUpdateUserByIdService, updateUserByIdService } from "../../application/services/userService.js";
import { dealCardsController } from "../http/controllers/gameController.js";
import { createUserController, deleteUserByIdController, getUserByIdController, getUserByTokenController, partiallyUpdateUserByIdController, updateUserByIdController } from "../http/controllers/userController.js";
import CardRepository from "../repository/cardRepository.js";
import SessionRepository from "../repository/sessionRepository.js";
import UserRepository from "../repository/userRepository.js";
import { JWT } from "../security/JWT.js";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const tokenService = new JWT();

const createUserFunctionality = createUserService(userRepository);
const getUserFunctionality = getUserByIdService(userRepository);
const updateUserFunctionality = updateUserByIdService(userRepository);
const partiallyUpdateUserFunctionality = partiallyUpdateUserByIdService(userRepository);
const deleteUserFunctionality = deleteUserByIdService(userRepository);
const getUserByTokenFunctionality = getUserByTokenService(sessionRepository, userRepository, tokenService)

export const createUser = createUserController(createUserFunctionality);
export const getUserById = getUserByIdController(getUserFunctionality);
export const updateUserById = updateUserByIdController(updateUserFunctionality); 
export const partiallyUpdateUserById = partiallyUpdateUserByIdController(partiallyUpdateUserFunctionality);
export const deleteUserById = deleteUserByIdController(deleteUserFunctionality);
export const getUserByToken = getUserByTokenController(getUserByTokenFunctionality);
