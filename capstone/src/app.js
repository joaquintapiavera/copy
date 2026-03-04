import express from "express";
import routes from "./infrastructure/http/routes/index.js";
import errorHandler from "./infrastructure/middlewares/errorHandler.js"
import cacheMiddleware from "./infrastructure/middlewares/cacheMiddleware.js";
import { cacheConfiguration } from "./config/cache.config.js";


// Declaration of the app
const app = express();

// Using JSON parser
app.use(express.json());

app.use(cacheMiddleware(cacheConfiguration));

// Defines the root route "/"
app.use("/api", routes);

// Uses the errorHanlder middleware
app.use(errorHandler);

//exports the app
export default app;
