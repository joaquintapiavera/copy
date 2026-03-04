
import {v4 as uuid} from 'uuid';

export const Score = {
    _id: {type: 'string', default: () => uuid(), visible: true},
    userId: {type: 'string', required: true, visible: true},
    gameId: {type: 'string', required: true, visible: true},
    value: {type: 'number', required: true, visible: true},
    createdAt: { type: 'date', default: () => new Date(), visible: true}
}