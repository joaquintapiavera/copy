import EndPointTrackRepository from "../repository/endPointTrackRepository.js";
import { v4 as uuid } from "uuid";

export function track  (handler)  {
    return async function (request, response, next) {
        const start = Date.now();
        response.on("finish", async () => {
            const duration = Date.now()-start;

            try {
                const endPointTrackRepository = new EndPointTrackRepository();
                await endPointTrackRepository.create({
                    _id: uuid(),
                    endpointAccess: request.originalUrl,
                    requestMethod: request.method,
                    statusCode: response.statusCode,
                    responseTime: duration,
                    timestamp: new Date(),
                    userId: request.user?.id || null
                }).run();
            } catch (error) {
                console.error(error.message);
            }
        });

        try {
            await handler(request, response, next);
        } catch (error) {
            next(error);
        }
    };
};