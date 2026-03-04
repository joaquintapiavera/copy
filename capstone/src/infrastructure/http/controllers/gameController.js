// Creates a new Game and forwards any error to the error middleware
export function createGameController(createGameService) {
    return async function(request, response, next){
        try {
            const data = {
                userId: request.user.id,
                ...request.body
            };
            const created = await createGameService(data).run();
            if(created.isLeft()){
                return response.status(400).json({
                    error: created.value
                });
            } else {
                return response.status(201).json(created.value);
            }
        } catch (error) {
            next(error)
        }
    }
}

// Gets a Game by ID and forwards any error to the error middleware
export function getGameByIdController(getGameByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const obtained = await getGameByIdService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json(obtained.value);
            }
        } catch(error){
            next(error);
        }

    }
}

// Updates an existing Game and forwards any error to the error middleware
export function updateGameByIdController(updateGameByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await updateGameByIdService(data).run();
            if(updated.isLeft()){
                return response.status(404).json({
                    error: updated.value
                });
            } else {
                return response.status(200).json(updated.value);
            }
        }catch(error){
            next(error);
        }
    }
}


// partially updates a Game and forwards any error to the error middleware
export function partiallyUpdateGameByIdController(partiallyUpdateGameByIdService){
    return async function(request, response, next){
        try{
            const data ={
                id: request.params.id,
                ...request.body 
            }
            const updated = await partiallyUpdateGameByIdService(data).run();
            if(updated.isLeft()){
                return response.status(404).json({
                    error: updated.value
                });
            } else{
                return response.status(200).json(updated.value);
            }
        }catch(error){
            next(error);
        }
    }
}

// Deletes a Game and forwards any error to the error middleware
export function deleteGameByIdController(deleteGameByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.params.id
            };
            const deleted = await deleteGameByIdService(data).run();
            if(deleted.isLeft()){
                return response.status(404).json({
                    error: deleted.value
                });
            } else {
                return response.status(204).send();
            }
        }catch(error){
            next(error);
        }
    }
}

export function joinGameController(joinGameService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id,
                token: request.body.access_token
            };
            const joined = await joinGameService(data).run();
            if(joined.isLeft()){
                return response.status(400).json({
                    error: joined.value
                });
            } else {
                return response.status(200).json({
                    message: "User joined the game successfully"
                });
            }
        }catch(error){
            next(error);
        }
    }
}

export function startGameController(startGameService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id,
                token: request.body.access_token
            };
            const started = await startGameService(data).run();
            if(started.isLeft()){
                return response.status(400).json({
                    error: started.value
                });
            } else {
                return response.status(200).json({
                    message: "Game started successfully"
                });
            }
        }catch(error){
            next(error);
        }
    }
}


export function leaveGameController(leaveGameService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id,
                token: request.body.access_token
            };
            const left = await leaveGameService(data).run();
            if(left.isLeft()){
                return response.status(400).json({
                    error: left.value
                });
            } else {
                return response.status(200).json({
                    message: "User left the game successfully"
                });
            }
        }catch(error){
            next(error);
        }
    }
}

export function endGameController(endGameService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id,
                token: request.body.access_token
            };
            const ended = await endGameService(data).run();
            if(ended.isLeft()){
                return response.status(400).json({
                    error: ended.value
                });
            } else {
                return response.status(200).json({
                    message: "Game ended successfully"
                });
            }
        }catch(error){
            next(error);
        }
    }
}

export function getGameStatusController(getGameByIdService){
    return async function(request, response, next){
        try{
            const data = {
                id: request.body.game_id
            };
            const obtained = await getGameByIdService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json({
                    game_id: data.id,
                    status: obtained.value.status
                });
            }
        } catch(error){
            next(error);
        }

    }
}

export function getPlayersNamesController(getPlayersNamesService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id
            };
            const obtained = await getPlayersNamesService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json({
                    game_id: data.gameId,
                    players: obtained.value
                });
            }
        } catch(error){
            next(error);
        }

    }
}

export function getCurrentPlayerController(getCurrentPlayerService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id
            };
            const obtained = await getCurrentPlayerService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json({
                    game_id: data.gameId,
                    current_player: obtained.value.username
                });
            }
        } catch(error){
            next(error);
        }

    }
}

export function getTopCardController(getTopCardService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id
            };
            const obtained = await getTopCardService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json({
                    game_id: data.gameId,
                    top_card: `${obtained.value.color} of ${obtained.value.type} with value ${obtained.value.value}`
                });
            }
        } catch(error){
            next(error);
        }

    }
}

export function getAllScoresController(getAllScoresService){
    return async function(request, response, next){
        try{
            const data = {
                gameId: request.body.game_id
            };
            const obtained = await getAllScoresService(data).run();
            if(obtained.isLeft()){
                return response.status(404).json({
                    error: obtained.value
                });
            } else {
                return response.status(200).json({
                    game_id: data.gameId,
                    scores: obtained.value
                });
            }
        } catch(error){
            next(error);
        }

    }
}

export function dealCardsController(dealCardsService){
    return async function(request, response, next) {
        try{
            const data ={
                players: request.body.players,
                cardsPerPlayer: request.body.cardsPerPlayer
            }
            const dealed = await dealCardsService(data).run()
            if(dealed.isLeft()){
                return response.status(400).json({
                    error: dealed.value
                })
            } else {
                return response.status(200).json({
                    message: 'Cards dealt successfully',
                    players: dealed.value
                })
            }
        }catch(error){
            next(error);
        }
    }
}

export function playCardController(playCardService){
    return async function(request, response, next) {
        try{
            const data ={
                player: request.body.player,
                cardPlayed: request.body.cardPlayed
            }
            const played = await playCardService(data).run()
            if(played.isLeft()){
                return response.status(400).json({
                    message: played.value
                })
            } else {
                return response.status(200).json({
                    message: 'Card played successfully',
                    nextPlayer: played.value.nextPlayer
                })
            }
        }catch(error){
            next(error);
        }   
    }
}

export function drawCardController(drawCardService){
    return async function(request, response, next) {
        try{
            const data ={
                player: request.body.player
            }
            const drawn = await drawCardService(data).run()
            if(drawn.isLeft()){
                return response.status(400).json({
                    message: drawn.value
                })
            } else {
                const drawnCard = drawn.value.drawnCard
                return response.status(200).json({
                    message: `${request.body.player} drew a card from the deck.`,
                    cardDrawn: `${drawnCard.color} ${drawnCard.value} ${drawnCard.type}`
                })
            }
        }catch(error){
            next(error);
        }
    }
}

export function sayUnoController(sayUnoService){
    return async function(request, response, next) {
        try{
            const data ={
                player: request.body.player,
                action: request.body.action
            }
            const said = await sayUnoService(data).run()
            if(said.isLeft()){
                return response.status(400).json({
                    message: said.value
                })
            } else {
                return response.status(200).json({
                    message: `${request.body.player} said UNO successfully`,
                })
            }
        }catch(error){
            next(error);
        }
    }
}

export function challengePlayerController(challengePlayerService){
    return async function(request, response, next) {
        try{
            const data ={
                challenger: request.body.challenger,
                challengedPlayer: request.body.challengedPlayer
            }
            const challenged = await challengePlayerService(data).run()
            if(challenged.isLeft()){
                return response.status(400).json({
                    message: challenged.value
                })
            } else {
                return response.status(200).json({
                    message: `Challenge successful. ${data.challengedPlayer} forgot to say UNO and draws 2 cards.`,
                    nextPlayer: challenged.value.nextPlayer
                })
            }
        }catch(error){
            next(error);
        }
    }
}

export function handleDrawCardController(handleDrawCardService){
    return async function(request, response, next) {
        try{
            const data ={
                player: request.body.player,
                action: request.body.action
            }
            const drawn = await handleDrawCardService(data).run()
            if(drawn.isLeft()){
                return response.status(400).json({
                    message: drawn.value
                })
            } else {
                return response.status(200).json(drawn.value)
            }
        }catch(error){
            next(error);
        }
    }
}

export function handlePlayCardController(handlePlayCardService){
    return async function(request, response, next) {
        try{
            const data ={
                player: request.body.player,
                action: request.body.action,
                cardPlayed: request.body.card,
                chosenColor: request.body.chosenColor
            }
            const played = await handlePlayCardService(data).run()
            if(played.isLeft()){
                return response.status(400).json({
                    message: played.value
                })
            } else {
                return response.status(200).json(played.value)
            }
        }catch(error){
            next(error);
        }
    }
}

export function getGameHistoryController(getGameHistoryService){
    return async function(request, response, next) {
        try{
            const data ={
                gameId: request.body.game_id
            }
            const obtained = await getGameHistoryService(data).run()
            if(obtained.isLeft()){
                return response.status(400).json({
                    message: obtained.value
                })
            } else {
                return response.status(200).json(obtained.value)
            }
        }catch(error){
            next(error);
        }
    }
}

export function getHandByUsernameController(getHandByUsernameService){
    return async function(request, response, next) {
        try{
            const data ={
                player: request.body.player
            }
            const obtained = await getHandByUsernameService(data).run()
            if(obtained.isLeft()){
                return response.status(400).json({
                    message: obtained.value
                })
            } else {
                return response.status(200).json({
                    player: data.player,
                    hand: obtained.value
                })
            }
        }catch(error){
            next(error);
        }
    }
}

export function getGameStateController(getGameStateService){
    return async function(request, response, next) {
        try{
            const data ={
                gameId: request.body.game_id
            }
            const obtained = await getGameStateService(data).run()
            if(obtained.isLeft()){
                return response.status(400).json({
                    message: obtained.value
                })
            } else {
                return response.status(200).json(obtained.value)
            }
        }catch(error){
            next(error);
        }
    }
}

export function getNextPlayerController(getNextPlayerService){
    return async function(request, response, next) {
        try{
            const data ={
                gameId: request.body.game_id
            }
            const obtained = await getNextPlayerService(data).run()
            if(obtained.isLeft()){
                return response.status(400).json({
                    message: obtained.value
                })
            } else {
                return response.status(200).json(obtained.value)
            }
        }catch(error){
            next(error);
        }
    }
}