import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { calculateMostPopularEndpoint, calculateRequestStats, calculateResponseTimes, calculateStatusCodes } from "../../domain/helpers/helpers.js";

export function getRequestsStatsService(endPointTrackRepository) {
    return function () {
        return AsyncEither.of(null)
            .flatMap(endPointTrackRepository.getAll)
            .map(calculateRequestStats);
    };
}

export function getResponseTimesService(endPointTrackRepository) {
    return function () {
        return AsyncEither.of(null)
            .flatMap(endPointTrackRepository.getAll)
            .map(calculateResponseTimes);
    };
}

export function getStatusCodesService(endPointTrackRepository) {
    return function () {
        return AsyncEither.of(null)
            .flatMap(endPointTrackRepository.getAll)
            .map(calculateStatusCodes);
    };
}

export function getPopularEndpointsService(endPointTrackRepository) {
    return function () {
        return AsyncEither.of(null)
            .flatMap(endPointTrackRepository.getAll)
            .map(calculateMostPopularEndpoint);
    };
}