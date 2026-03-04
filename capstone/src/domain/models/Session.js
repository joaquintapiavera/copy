
import {v4 as uuid} from 'uuid';

export const Session = {
    _id: {type: 'string', default: () => uuid(), visible: true},
    token: {type: 'string', required: true, visible: true},
    userId: {type: 'string', required: true, visible: true},
    revoked: {type: 'boolean', required: true, default: false, visible: true},
    createdAt: { type: 'date', default: () => new Date(), visible: true}
}
