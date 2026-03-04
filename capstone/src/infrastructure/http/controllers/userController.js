import { requireExistence } from "../../../domain/validators/sharedValidators.js";

// Creates a new User and forwards any error to the error middleware
export function createUserController(createUserService) {
    return async function(request, response, next){
        try {
            const data = {
                ...request.body
            };
            const created = await createUserService(data).run();
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

// Gets a User by ID and forwards any error to the error middleware
export function getUserByIdController(getUserByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const obtained = await getUserByIdService(data).run();
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

// Updates an existing User and forwards any error to the error middleware
export function updateUserByIdController(updateUserByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await updateUserByIdService(data).run();
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


// partially updates a User and forwards any error to the error middleware
export function partiallyUpdateUserByIdController(partiallyUpdateUserByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await partiallyUpdateUserByIdService(data).run();
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

// Deletes a User and forwards any error to the error middleware
export function deleteUserByIdController(deleteUserByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const deleted = await deleteUserByIdService(data).run();
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

// Deletes a User and forwards any error to the error middleware
export function getUserByTokenController(getUserByTokenService){
    return async function(request, response, next){
        try{
            const data = {
                token: request.body.access_token
            };
            const obtained = await getUserByTokenService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json(obtained.value)
            }
        }catch(error){
            next(error);
        }
    }
}