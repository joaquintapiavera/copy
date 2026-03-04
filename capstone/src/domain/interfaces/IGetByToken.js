import { Left } from "../../shared/monads/Either";

export default class IGetByToken{
    getbyToken(token){
        return Left('method must be implemented')
    }
}