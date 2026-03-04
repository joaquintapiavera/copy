import { requireExistence } from "../../../domain/validators/sharedValidators.js";

// Creates a new Score and forwards any error to the error middleware
export function createScoreController(createScoreService) {
    return async function(request, response, next){
        try {
            const data = {
                ...request.body
            };
            const created = await createScoreService(data).run();
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

// Gets a Score by ID and forwards any error to the error middleware
export function getScoreByIdController(getScoreByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const obtained = await getScoreByIdService(data).run();
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

// Updates an existing Score and forwards any error to the error middleware
export function updateScoreByIdController(updateScoreByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await updateScoreByIdService(data).run();
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


// partially updates a Score and forwards any error to the error middleware
export function partiallyUpdateScoreByIdController(partiallyUpdateScoreByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await partiallyUpdateScoreByIdService(data).run();
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

// Deletes a Score and forwards any error to the error middleware
export function deleteScoreByIdController(deleteScoreByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const deleted = await deleteScoreByIdService(data).run();
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