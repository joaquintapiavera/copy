import {v4 as uuid} from 'uuid';

export const User = {
    _id: {type: 'string', default: () => uuid(),visible: true },
    username: {type: 'string', required: true, visible: true},
    email: {type: 'string', required: true, visible: true},
    password: {type: 'string', required: true, visible: false},
    isReady: {type: 'boolean',  default: true, visible: true},
    saidUno: {type: 'boolean',  default: false, visible: true},
    hand: {type: 'array', default: [], visible: true},
    score: {type: 'number', default: 0, visible: true},
    createdAt: { type: 'date', default: () => new Date(), visible: true}
}

