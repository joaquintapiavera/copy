import { loginService, logoutService, registerService } from "../../application/services/authService.js";
import { registerUserController, loginController, logoutController } from "../../infrastructure/http/controllers/authController.js";
import SessionRepository from "../../infrastructure/repository/sessionRepository.js";
import UserRepository from "../../infrastructure/repository/userRepository.js";
import { Bcrypt } from "../../infrastructure/security/Bcrypt.js";
import { JWT } from "../../infrastructure/security/JWT.js";
import dotenv from "dotenv"

dotenv.config();

const userRepository = new UserRepository();
const passwordService = new Bcrypt();
const tokenService = new JWT();
const sessionRepository = new SessionRepository();


const registerUserFunctionality = registerService(userRepository, passwordService);
const loginFunctionality = loginService(userRepository, sessionRepository, tokenService, passwordService); 
const logoutFunctionality = logoutService(sessionRepository, tokenService);

export const registerUser = registerUserController(registerUserFunctionality);
export const loginUser = loginController(loginFunctionality);
export const logoutUser = logoutController(logoutFunctionality);
