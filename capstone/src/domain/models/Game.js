import {v4 as uuid} from 'uuid';

export const Game = {
    _id: {type: 'string', default: () => uuid(), visible: true},
    name: {type: 'string', required: true, visible: true},
    rules: {type: 'string', required: true, visible: true},
    status: {type: 'string', default: 'WAITING', visible: true},
    maxPlayers: {type: 'number', default: 4, visible: true},
    creatorId: {type: 'string', visible: true},
    playersIds: {type: 'array', default: [], visible: true},
    turnIndex: {type: 'number', default: 0, visible: true},
    topCard: {type: 'string', visible: true, default: '0'},
    clockwise:{type: 'boolean', visible: true, default: true},
    history: {type: 'array', default: [], visible: true},
    createdAt: { type: 'date', default: () => new Date(), visible: true}
}
