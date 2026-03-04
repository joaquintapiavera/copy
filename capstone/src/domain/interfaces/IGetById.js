import { Left } from "../../shared/monads/Either";

export default class IGetById{
    getById(id){
        return Left('method must be implemented')
    }

}