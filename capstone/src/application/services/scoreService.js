import { toDefault } from "../../domain/helpers/helpers.js";
import { Score } from "../../domain/models/Score.js";
import { validateRequiredFields, toResponse, validateAtLeastOneField } from "../../domain/validators/schemaValidators.js";
import { validateIdExistence, validateNoIdInData } from "../../domain/validators/sharedValidators.js";
import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { liftEither} from "../../shared/monads/Lifts.js";



export function createScoreService(scoreRepository) {
    return function (data) {
        return AsyncEither.of(data)
            .map(toDefault(Score))
            .flatMap(liftEither(validateRequiredFields(Score)))
            .flatMap(scoreRepository.create)
            .map(toResponse(Score));
    }
}

export function getScoreByIdService(scoreRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(scoreRepository.getById)
            .map(toResponse(Score))
        
    };
}

export function updateScoreByIdService(scoreRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateRequiredFields(Score)))
            .flatMap(scoreRepository.updateById(data.id))
            .map(toResponse(Score));
    }
}

export function partiallyUpdateScoreByIdService(scoreRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateAtLeastOneField))
            .flatMap(scoreRepository.updateById(data.id))
            .map(toResponse(Score));
    }
}

export function deleteScoreByIdService(scoreRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(scoreRepository.deleteById)
            .map(toResponse(Score));
    }
}