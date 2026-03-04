import winston from "winston";

const logger = winston.createLogger({
    level: "error",
    transports: [
        new winston.transports.File({
            filename: "error.log"
        })
    ]
});

export default logger;