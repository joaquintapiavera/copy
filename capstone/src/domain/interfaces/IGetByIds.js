import { Left } from "../../shared/monads/Either";

export default class IGetByIds{
    getbyIds(ids){
        return Left('method must be implemented')
    }
}