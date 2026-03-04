import { toDefault } from "../../domain/helpers/helpers.js";
import { Card } from "../../domain/models/Card.js";
import { validateRequiredFields, toResponse, validateAtLeastOneField } from "../../domain/validators/schemaValidators.js";
import { validateIdExistence, validateNoIdInData } from "../../domain/validators/sharedValidators.js";
import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { liftEither} from "../../shared/monads/Lifts.js";



export function createCardService(cardRepository) {
    return function (data) {
        return AsyncEither.of(data)
            .map(toDefault(Card))
            .flatMap(liftEither(validateRequiredFields(Card)))
            .flatMap(cardRepository.create)
            .map(toResponse(Card));
    }
}

export function getCardByIdService(cardRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(cardRepository.getById)
            .map(toResponse(Card))
        
    };
}

export function updateCardByIdService(cardRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateRequiredFields(Card)))
            .flatMap(cardRepository.updateById(data.id))
            .map(toResponse(Card));
    }
}

export function partiallyUpdateCardByIdService(cardRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateAtLeastOneField))
            .flatMap(cardRepository.updateById(data.id))
            .map(toResponse(Card));
    }
}

export function deleteCardByIdService(cardRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(cardRepository.deleteById)
            .map(toResponse(Card));
    }
}
