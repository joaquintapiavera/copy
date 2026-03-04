import { Left } from "../../shared/monads/Either";

export default class IUpdateById{

    updateById(id, data){
        return Left('method must be implemented')
    }

}