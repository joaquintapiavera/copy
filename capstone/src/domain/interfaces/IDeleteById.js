import { Left } from "../../shared/monads/Either";

export default class IDeleteById{
    deleteById(id){
        return Left('method must be implemented')
    }
}