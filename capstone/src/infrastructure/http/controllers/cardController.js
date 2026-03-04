import { requireExistence } from "../../../domain/validators/sharedValidators.js";

// Creates a new card and forwards any error to the error middleware
export function createCardController(createCardService) {
    return async function(request, response, next){
        try {
            const data = {
                ...request.body
            };
            const created = await createCardService(data).run();
            if(created.isLeft()){
                return response.status(400).json({
                    error: created.value
                });
            } else {
                return response.status(201).json(created.value);
            }
        } catch (error) {
            next(error)
        }
    }
}

// Gets a card by ID and forwards any error to the error middleware
export function getCardByIdController(getCardByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const obtained = await getCardByIdService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json(obtained.value);
            }
        } catch(error){
            next(error);
        }

    }
}

// Updates an existing card and forwards any error to the error middleware
export function updateCardByIdController(updateCardByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await updateCardByIdService(data).run();
            if(updated.isLeft()){
                return response.status(404).json({
                    error: updated.value
                });
            } else {
                return response.status(200).json(updated.value);
            }
        }catch(error){
            next(error);
        }
    }
}


// partially updates a card and forwards any error to the error middleware
export function partiallyUpdateCardByIdController(partiallyUpdateCardByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await partiallyUpdateCardByIdService(data).run();
            if(updated.isLeft()){
                return response.status(404).json({
                    error: updated.value
                });
            } else{
                return response.status(200).json(updated.value);
            }
        }catch(error){
            next(error);
        }
    }
}

// Deletes a card and forwards any error to the error middleware
export function deleteCardByIdController(deleteCardByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const deleted = await deleteCardByIdService(data).run();
            if(deleted.isLeft()){
                return response.status(404).json({
                    error: deleted.value
                });
            } else {
                return response.status(204).send();
            }
        }catch(error){
            next(error);
        }
    }
}