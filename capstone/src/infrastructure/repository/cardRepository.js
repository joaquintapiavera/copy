
import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { Either, Left, Right } from "../../shared/monads/Either.js";
import MongoCard from "../mongo_schemas/card.js";

export default class CardRepository{
    create(data){
        return AsyncEither.fromPromise(
            async function(){
                const created = await MongoCard.create(data);
                return created? Either.right(created.toObject())
                : Either.left('Not created');
            }
        )
    }

    getById(id){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoCard.findById(id);
                return obtained? Either.right(obtained.toObject())
                :Either.left('Not Found');
            }
        )
    }

    updateById(id){
        return function(data) {
            return AsyncEither.fromPromise(
                async function(){
                    const updated = await MongoCard.findByIdAndUpdate(
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
                const deleted = await MongoCard.findByIdAndDelete(id);
                return deleted? Either.right(deleted.toObject())
                : Either.left('Not found');
            }
        )    
    }

    createMultiple(cards) {
        return AsyncEither.fromPromise(async function() {
            const creations = cards.map(card => MongoCard.create(card));
            const resolved = await Promise.all(creations);
            const plain = resolved.map(doc => doc ? doc.toObject() : null);
            return plain.every(c => c) ? Either.right(plain) : Either.left('Creation failed');
        });
    }
    getByIds(ids) {
        return AsyncEither.fromPromise(async function() {
            const obtained = await MongoCard.find({ _id: { $in: ids } });
            const foundIds = new Set(obtained.map(doc => doc._id.toString()));
            const requestedIds = new Set(ids.map(id => id.toString()));
        
            
            const plain = obtained.map(doc => doc.toObject());
            return Either.right(plain);
        });
    }

}