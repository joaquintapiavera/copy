import { toDefault } from "../../domain/helpers/helpers.js";
import { User } from "../../domain/models/User.js";
import { validateRequiredFields, toResponse, validateAtLeastOneField } from "../../domain/validators/schemaValidators.js";
import { validateIdExistence, validateNoIdInData } from "../../domain/validators/sharedValidators.js";
import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { liftEither} from "../../shared/monads/Lifts.js";
import { getSessionByTokenService } from "./sessionService.js";

export function createUserService(userRepository) {
    return function (data) {
        return AsyncEither.of(data)
            .flatMap(liftEither(validateRequiredFields(User)))
            .map(toDefault(User))
            .flatMap(userRepository.create)
            .map(toResponse(User));
    }
}

export function getUserByIdService(userRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(userRepository.getById)
            .map(toResponse(User))
        
    };
}

export function updateUserByIdService(userRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateRequiredFields(User)))
            .flatMap(userRepository.updateById(data.id))
            .map(toResponse(User));
    }
}

export function partiallyUpdateUserByIdService(userRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateAtLeastOneField))
            .flatMap(userRepository.updateById(data.id))
            .map(toResponse(User));
    }
}

export function deleteUserByIdService(userRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(userRepository.deleteById)
            .map(toResponse(User));
    }
}

export function getUserByUsernameService(userRepository){
    return function(data){
        return AsyncEither.of(data.username)
            .flatMap(userRepository.getByUsername)
    };
}

export function getUserByTokenService(sessionRepository, userRepository, tokenService){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(getSessionByTokenService(sessionRepository))
            .flatMap(tokenService.verifyToken)
            .flatMap(getUserByUsernameService(userRepository))
            .map(toResponse(User))
    }
}
