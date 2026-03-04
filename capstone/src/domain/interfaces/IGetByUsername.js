import { Left } from "../../shared/monads/Either";

export default class IGetByUsername{
    getbyUsername(username){
        return Left('method must be implemented')
    }
}