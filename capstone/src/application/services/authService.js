import { mapSession, pickRequiredFields, selectField, toDefault, updateField } from "../../domain/helpers/helpers.js";
import { Session } from "../../domain/models/Session.js";
import { User } from "../../domain/models/User.js";
import { recover, rejectIfExists, requireExistence, validateNoIdInData } from "../../domain/validators/sharedValidators.js";
import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { liftEither } from "../../shared/monads/Lifts.js";
import { createSessionService, getSessionByTokenService,partiallyUpdateSessionByTokenService, updateSessionByIdService } from "./sessionService.js";
import { createUserService, getUserByUsernameService } from "./userService.js";

export function registerService(userRepository, passwordService) {
    return function (data) {
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(checkUsernameNotExists(userRepository))
            .flatMap(passwordService.hashPassword)
            .map(toDefault(User))
            .flatMap(createUserService(userRepository));
    };
}

export function loginService(userRepository, sessionRepository, tokenService, passwordService){
    return function(data){
        const plainPassword = data.password;
        return AsyncEither.of(data)
            .flatMap(getUserByUsernameService(userRepository))
            .flatMap(liftEither(requireExistence))
            .flatMap(passwordService.compare(plainPassword))
            .flatMap(tokenService.generateToken)
            .map(mapSession)
            .flatMap(createSessionService(sessionRepository))
            .map(selectField("token"))
    }
}

export function logoutService(sessionRepository, tokenService){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(getSessionByTokenService(sessionRepository))
            .flatMap(tokenService.verifyToken)
            .flatMap(liftEither(requireExistence))
            .map(updateField("revoked", true))
            .map(pickRequiredFields(Session))
            .flatMap(partiallyUpdateSessionByTokenService(sessionRepository))
    }
}


export function checkUsernameNotExists(userRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(doesNotExistByUsernameService(userRepository)) 
            .flatMap(liftEither(rejectIfExists))
            .map(recover(data));
    }
}

export function doesNotExistByUsernameService(userRepository){
    return function(data){
        return AsyncEither.of(data.username)
            .flatMap(userRepository.doesNotExistByUsername)
    }
}


