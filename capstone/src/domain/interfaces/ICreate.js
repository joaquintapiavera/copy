import { Left } from "../../shared/monads/Either";

export default class ICreate{
    crate(data){
        return Left('method must be implemented')
    }
}