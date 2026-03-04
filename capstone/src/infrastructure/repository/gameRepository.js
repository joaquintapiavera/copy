import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { Either, Left, Right } from "../../shared/monads/Either.js";
import MongoGame from "../mongo_schemas/game.js";

export default class GameRepository{
    create(data){
        return AsyncEither.fromPromise(
            async function(){
                const created = await MongoGame.create(data);
                return created? Either.right(created.toObject())
                : Either.left('Not created');
            }
        )
    }

    getById(id){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoGame.findById(id);
                return obtained? Either.right(obtained.toObject())
                :Either.left('Not Found');
            }
        )
    }

    updateById(id){
        return function(data) {
            return AsyncEither.fromPromise(
                async function(){
                    const updated = await MongoGame.findByIdAndUpdate(
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
                const deleted = await MongoGame.findByIdAndDelete(id);
                return deleted? Either.right(deleted.toObject())
                : Either.left('Not found');
            }
        )    
    }
    getGameByUserId(userId){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoGame.find({
                    $or: [
                        { creatorId: userId },
                        { playersIds: userId }
                    ]
                });
                const game = obtained[0].toObject();
                
                console.log(game)
                return Either.right(game);
            }
        )
    }

}