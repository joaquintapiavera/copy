import { AsyncEither } from "./AsyncEither.js";

export function liftEither(operation) {
    return function (data) {
        
        return AsyncEither.fromEither(operation(data));
    };
}
