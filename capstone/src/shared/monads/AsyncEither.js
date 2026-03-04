import { Either } from "./Either.js";

export class AsyncEither {
    constructor(executor) {
        this._executor = executor;
    }

    run() {
        return Promise.resolve(this._executor());
    }


    map(operation) {
        const self = this;
        return new AsyncEither(
            function(){
                return self.run().then(
                    function(either){
                        return either.isLeft()? either
                        :Either.of(operation(either.value))
                    }
                )
            }
        )
    }

    flatMap(operation) {
        const self = this;
        return new AsyncEither(
            function(){
                return self.run().then(
                    function(either){
                        if(either.isLeft()) return either;
                        const result = operation(either.value)
                        if (!(result instanceof AsyncEither)) {
                            throw new Error("Invalid function");
                        }
                        return result.run()
                    }
                )
            }
        );
    }

    
    static of(value) {
        return new AsyncEither(
            function(){
                return Promise.resolve(Either.of(value));
            }
        );
    }

    static fromEither(either) {
        return new AsyncEither(
            function(){
                return Promise.resolve(
                    (either instanceof Either)? either
                    : Either.of(either)
                )
            }
        )
    }

    static fromPromise(promise){
        return new AsyncEither(
            function(){
                const isfunction =(typeof promise == 'function')? promise()
                : promise;
                return Promise.resolve(isfunction)
                    .then(result => (result instanceof Either ? result : Either.of(result)))
                    .catch(err => Either.left(err.message));
            }
        )
    }
}
