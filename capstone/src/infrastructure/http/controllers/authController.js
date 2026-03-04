
// Registers a user
export function registerUserController(registerUserService){
    return async function (request, response, next) {
        try{
            const data = {
                ...request.body
            }
            const registered = await registerUserService(data).run();
            if (registered.isLeft()) {
                return response.status(400).json({
                    error: registered.value
                });
            } else {
                return response.status(201).json({
                    message:'User registered successfully'
                });
            }
        } catch(error) {
            next(error)
        }
    }
}

// logs in a user
export function loginController(loginService){
    return async function (request, response, next) {
        try{
            const data = {
                ...request.body
            }
            const loggedIn = await loginService(data).run();
            if (loggedIn.isLeft()) {
                return response.status(400).json({
                    error: loggedIn.value
                });
            } else {
                return response.status(200).json({
                    access_token: loggedIn.value
                });
            }
        } catch(error) {
            next(error)
        }
    }
}

// Logs out and invalidates a token
export function logoutController(logoutService){
    return async function (request, response, next) {
        try{
            const data = {
                token: request.body.access_token
            }
            const loggedOut = await logoutService(data).run();
            if (loggedOut.isLeft()) {
                return response.status(400).json({
                    error: loggedOut.value
                });
            } else {
                return response.status(200).json({
                    access_token: "User logged out successfully"
                });
            }
        } catch(error) {
            next(error)
        }
    }
}