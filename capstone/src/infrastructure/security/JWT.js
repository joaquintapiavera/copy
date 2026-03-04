
import { AsyncEither } from '../../shared/monads/AsyncEither.js';
import { Either } from '../../shared/monads/Either.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE_TIME = process.env.JWT_EXPIRE_TIME;

export class JWT {

    generateToken(data) {
        return AsyncEither.fromPromise(
            async function() {
                const payload = { id: data._id, username: data.username };
                const token = jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRE_TIME});
                return token? Either.right({...data, token})
                : Either.left('Token error')
            }
        );
    }


    verifyToken(data){
        return AsyncEither.fromPromise(
            async function () {
                const decoded = jwt.verify(data.token,  JWT_SECRET);
                return decoded? Either.right({...data, ...decoded})
                : Either.left('Token error')
            }
        )
    }
}