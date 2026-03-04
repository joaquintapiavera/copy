import { getPopularEndpointsService, getRequestsStatsService, getResponseTimesService, getStatusCodesService } from "../../application/services/endPointTrackService.js";
import { getPopularEndpointsController, getRequestsStatsController, getResponseTimesController, getStatusCodesController } from "../http/controllers/endPointTrackController.js";
import EndPointTrackRepository from "../repository/endPointTrackRepository.js";


const endPointTrackRepository = new EndPointTrackRepository();
const getRequestsStatsFunctionality = getRequestsStatsService(endPointTrackRepository);
const getResponseTimesFunctionality = getResponseTimesService(endPointTrackRepository);
const getStatusCodesFunctionality = getStatusCodesService(endPointTrackRepository);
const getPopularEndpointsFunctionality = getPopularEndpointsService(endPointTrackRepository)

export const getRequestsStats = getRequestsStatsController(getRequestsStatsFunctionality);
export const getResponseTimes = getResponseTimesController(getResponseTimesFunctionality);
export const getStatusCodes = getStatusCodesController(getStatusCodesFunctionality);
export const getPopularEndpoints =getPopularEndpointsController(getPopularEndpointsFunctionality);
