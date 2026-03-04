import { toDefault } from "../../domain/helpers/helpers.js";
import { Session } from "../../domain/models/Session.js";
import { validateRequiredFields, toResponse, validateAtLeastOneField } from "../../domain/validators/schemaValidators.js";
import { validateIdExistence, validateNoIdInData } from "../../domain/validators/sharedValidators.js";
import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { liftEither} from "../../shared/monads/Lifts.js";



export function createSessionService(sessionRepository) {
    return function (data) {
        return AsyncEither.of(data)
            .map(toDefault(Session))
            .flatMap(liftEither(validateRequiredFields(Session)))
            .flatMap(sessionRepository.create)
            .map(toResponse(Session));
    }
}

export function getSessionByIdService(sessionRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(sessionRepository.getById)
            .map(toResponse(Session))
        
    };
}

export function updateSessionByIdService(sessionRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateRequiredFields(Session)))
            .flatMap(sessionRepository.updateById(data.id))
            .map(toResponse(Session));
    }
}

export function partiallyUpdateSessionByIdService(sessionRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateAtLeastOneField))
            .flatMap(sessionRepository.updateById(data.id))
            .map(toResponse(Session));
    }
}

export function deleteSessionByIdService(sessionRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(sessionRepository.deleteById)
            .map(toResponse(Session));
    }
}

export function getSessionByTokenService(sessionRepository) {
    return function(data) {
        return AsyncEither.of(data.token)
            .flatMap(sessionRepository.getByToken)
            .map(toResponse(Session))
    };
}

export function partiallyUpdateSessionByTokenService(sessionRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateAtLeastOneField))
            .flatMap(sessionRepository.updateByToken(data.token))
            .map(toResponse(Session));
    }
}
