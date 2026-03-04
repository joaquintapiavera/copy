import logger from "./logger.js";

export default function errorHandler(error, request, response, next){
    logger.error(error.stack);
    console.error(error);
    let status = 500;
    let message = 'Internal Server Error';
    
    if (error && typeof error === 'object' && error.status != null) {
        status = error.status;
    }
    if (error && error.message) {
        message = error.message;
    } else if (error !== undefined && error !== null) {
        message = String(error);
    }
    
    response.status(status).json({ message: message });
}