import { Either } from "../../shared/monads/Either.js";

export function validateIdExistence(id){
    return id? Either.right(id)
    : Either.left('ID required')
}

export function validateNoIdInData(data) {
    return data._id? Either.left('ID can not be modified')
    : Either.right(data)
}

export function rejectIfExists(data) {
    return data ? Either.left('Already Exists')
    :Either.right(data);
}

export function requireExistence(data) {

    return data ? Either.right(data)
    :Either.left('Not found');
}

export function recover(data) {
    return function(ignoreData){
        return data;
    }
}
