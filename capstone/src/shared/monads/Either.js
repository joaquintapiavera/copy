export class Either {
    constructor(value){
        this._value = value;
    }
    static left(value){
        return new Left(value);
    }

    static right(value){
        return new Right(value);
    }

    static of(value){
        return new Right(value);
    }

    get value(){
        return this._value;
    }

}

export class Left extends Either{
    constructor(value){
        super(value);
    }

    map(operation){
        return this;
    }

    flatMap(operation){
        return this;
    }

    getOrElse(defaultValue){
        return defaultValue;
    }

    isLeft(){
        return true;
    }

    isRight(){
        return false;
    }
}

export class Right extends Either{
    constructor(value){
        super(value);
    }
    map(operation){
        return new Right(operation(this._value));
    }
    flatMap(operation){
        return operation(this._value);
    }
    getOrElse(defaultValue){
        return this._value;
    }

    isLeft(){
        return false;
    }

    isRight(){
        return true;
    }
}