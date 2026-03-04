import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { Either, Left, Right } from "../../shared/monads/Either.js";
import MongoUser from "../mongo_schemas/user.js";

export default class UserRepository{
    create(data){
        return AsyncEither.fromPromise(
            async function(){
                const created = await MongoUser.create(data);
                return created? Either.right(created.toObject())
                : Either.left('Not created');
            }
        )
    }

    getById(id){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoUser.findById(id);
                return obtained? Either.right(obtained.toObject())
                :Either.left('Not found');
            }
        )
    }

    updateById(id){
        return function(data) {
            return AsyncEither.fromPromise(
                async function(){
                    const updated = await MongoUser.findByIdAndUpdate(
                        id, { $set: data }, { new: true }
                    )
                    return updated? Either.right(updated.toObject())
                    :Either.left('Not found');
                }
            )
        };
    }

    deleteById(id){
        return AsyncEither.fromPromise(
            async function(){
                const deleted = await MongoUser.findByIdAndDelete(id);
                return deleted? Either.right(deleted.toObject())
                : Either.left('Not found');
            }
        )    
    }

    getByUsername(username){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoUser.findOne({username : username})
                return obtained? Either.right(obtained.toObject())
                :Either.left('Not found');
            }
        )
    }

    
    getByIds(ids) {
        return AsyncEither.fromPromise(async function() {
            const users = ids.map(id => MongoUser.findById(id));
            const resolved = await Promise.all(users);
            const plain = resolved.map(document => document ? document.toObject():null);
            return plain.every(user => user)? Either.right(plain) : Either.left('Not found');
        });
    }

    updateMultiple(ids) {
        return function(datas) {
            return AsyncEither.fromPromise(async function() {
                const updates = ids.map((id, index) =>
                    MongoUser.findByIdAndUpdate(id, 
                        {$set: datas[index]}, {new: true})
                        .then(document => document ? document.toObject() : null)
                );
                const resolved = await Promise.all(updates);
                return Either.right(resolved);
            });
        };
    }

    getUsersByUsername(usernames) {
        return AsyncEither.fromPromise(async function() {
            const promises = usernames.map(username => MongoUser.findOne({ username }));
            const resolved = await Promise.all(promises);
            const plain = resolved.map(document => document ? document.toObject(): null);
            return plain.every(user => user)?Either.right(plain)
            : Either.left('Not found');
        });
    }

    doesNotExistByUsername(username){
        return AsyncEither.fromPromise(
            async function(){
                const obtained = await MongoUser.findOne({username})
                return Either.right(obtained ? obtained.toObject() : null);
            }
        )
    }

}