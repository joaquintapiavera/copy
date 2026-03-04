import { Left } from "../../shared/monads/Either";

export default class IUpdateByToken{
    updateByToken(token){
        return Left('method must be implemented')
    }
}