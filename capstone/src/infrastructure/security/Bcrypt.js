import bcrypt from 'bcrypt';
import { AsyncEither } from '../../shared/monads/AsyncEither.js';
import { Either } from '../../shared/monads/Either.js';

export class Bcrypt {
    hashPassword(data) {
        return AsyncEither.fromPromise(
            async function(){
                const hash = await bcrypt.hash(data.password, 10);
                return Either.right({...data, password: hash});
            }
        )
    
    }

    compare(plainPassword) {
        return function(data) {
            return AsyncEither.fromPromise(async function() {
                const result = await bcrypt.compare(plainPassword, data.password);
                return result? Either.right(data) 
                : Either.left('Invalid Credentials');
            });
        };
    }
}