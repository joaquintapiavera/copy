import { v4 as uuid } from 'uuid';

export const EndPointTrack = {
    _id: { type: 'string', default: () => uuid(), visible: true },
    endpointAccess: { type: 'string', required: true, visible: true },
    requestMethod: { type: 'string', required: true, visible: true },
    statusCode: { type: 'number', required: true, visible: true },
    responseTime: { type: 'number', required: true, visible: true },
    timestamp: { type: 'date', required: true, visible: true },
    userId: { type: 'string', default: null, visible: true },
    createdAt: { type: 'date', default: () => new Date(), visible: true }
};