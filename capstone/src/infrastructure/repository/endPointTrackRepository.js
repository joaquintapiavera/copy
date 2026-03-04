import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { Either } from "../../shared/monads/Either.js";
import MongoEndPointTrack from "../mongo_schemas/endPointTrack.js";

export default class EndPointTrackRepository {
    create(data) {
        return AsyncEither.fromPromise(
            async function () {
                const created = await MongoEndPointTrack.create(data);
                return created ? Either.right(created.toObject())
                : Either.left("Not created");
            }
        );
    }

    getAll() {
        return AsyncEither.fromPromise(
            async function () {
                const obtained = await MongoEndPointTrack.find();
                const plain = obtained.map(d => d.toObject());
                return plain? Either.right(plain)
                : Either.left("Not found")
            }
        );
    }
}