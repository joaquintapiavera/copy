
import {v4 as uuid} from 'uuid';

export const Card = {
    _id: {type: 'string', default: () => uuid(),visible: true},
    color: {type: 'string', required:true,visible: true},
    value: {type: 'number', required: true,  visible: true},
    type:{type: 'string', required:true, visible: true},
    createdAt: { type: 'date', default: () => new Date(), visible: true},
};

