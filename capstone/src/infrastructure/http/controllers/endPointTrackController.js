
export function getRequestsStatsController(getRequestsStatsService){
    return async function (request, response, next) {
        try{
            const obtained = await getRequestsStatsService().run();
            if (obtained.isLeft()) {
                return  response.status(400).json(obtained.value);
            } else {
                return  response.status(200).json(obtained.value);
            }
        } catch(error) {
            next(error)
        }
    }
}

export function getResponseTimesController(getResponseTimesService){
    return async function (request, response, next) {
        try{
            const obtained = await getResponseTimesService().run();
            if (obtained.isLeft()) {
                return  response.status(400).json(obtained.value);
            } else {
                return  response.status(200).json(obtained.value);
            }
        } catch(error) {
            next(error)
        }
    }
}

export function getStatusCodesController(getStatusCodesService){
    return async function (request, response, next) {
        try{
            const obtained = await getStatusCodesService().run();
            if (obtained.isLeft()) {
                return response.status(400).json(obtained.value);
            } else {
                return response.status(200).json(obtained.value);
            }
        } catch(error) {
            next(error)
        }
    }
}

export function getPopularEndpointsController(getPopularEndpointsService){
    return async function (request, response, next) {
        try{
            const obtained = await getPopularEndpointsService().run();
            if (obtained.isLeft()) {
                return response.status(400).json(obtained.value);
            } else {
                return response.status(200).json(obtained.value);
            }
        } catch(error) {
            next(error)
        }
    }
}