import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { Either, Left, Right } from "../../shared/monads/Either.js";
import MongoSession from "../mongo_schemas/session.js";

export default class SessionRepository{
    create(data){
        return AsyncEither.fromPromise(
            async function(){
                const created = await MongoSession.create(data);
                return created? Either.right(created.toObject())
                : Either.left('Not created');
            }
        )
    }

    getById(id){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoSession.findById(id);
                return obtained? Either.right(obtained.toObject())
                :Either.left('Not Found');
            }
        )
    }

    updateById(id){
        return function(data) {
            return AsyncEither.fromPromise(
                async function(){
                    const updated = await MongoSession.findByIdAndUpdate(
                        id, { $set: data }, { new: true }
                    )
                    return updated? Either.right(updated.toObject())
                    : Either.left('Not found');
                }
            )
        };
    }

    deleteById(id){
        return AsyncEither.fromPromise(
            async function(){
                const deleted = await MongoSession.findByIdAndDelete(id);
                return deleted? Either.right(deleted.toObject())
                : Either.left('Not found');
            }
        )    
    }

    getByToken(token){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoSession.findOne({token: token});
                return obtained? Either.right(obtained.toObject())
                :Either.left('Not Found');
            }
        )
    }

    updateByToken(token){
        return function(data) {
            return AsyncEither.fromPromise(
                async function(){
                    const updated = await MongoSession.findOneAndUpdate(
                        {token: token}, { $set: data }, { new: true }
                    )
                    return updated? Either.right(updated.toObject())
                    : Either.left('Not found');
                }
            )
        };
    }

}