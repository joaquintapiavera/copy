import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { Either, Left, Right } from "../../shared/monads/Either.js";
import MongoScore from "../mongo_schemas/score.js";

export default class ScoreRepository{
    create(data){
        return AsyncEither.fromPromise(
            async function(){
                const created = await MongoScore.create(data);
                return created? Either.right(created.toObject())
                : Either.left('Not created');
            }
        )
    }

    getById(id){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoScore.findById(id);
                return obtained? Either.right(obtained.toObject())
                :Either.left('Not Found');
            }
        )
    }

    updateById(id){
        return function(data) {
            return AsyncEither.fromPromise(
                async function(){
                    const updated = await MongoScore.findByIdAndUpdate(
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
                const deleted = await MongoScore.findByIdAndDelete(id);
                return deleted? Either.right(deleted.toObject())
                : Either.left('Not found');
            }
        )    
    }

    createMultiple(scores){
            return AsyncEither.fromPromise(async function(){
                const creations = scores.map(score => MongoScore.create(score));
                const resolved = await Promise.all(creations);
                const plain = resolved.map(doc => doc ? doc.toObject() : null);
                return plain.every(s => s)? Either.right(plain)
                : Either.left('Creation failed');
            });
    }
    getByGameId(gameId) {
        
        return AsyncEither.fromPromise(
            async function() {
                try {
                    const scores = await MongoScore.find({ gameId });
                    return Either.right(scores.map(score => score.toObject()));
                } catch (error) {
                    return Either.left(error.message);
                }
            }
        );
    }

}