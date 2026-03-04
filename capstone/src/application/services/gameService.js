
import { applyCardEffect, attachHandCards, buildGameState, buildNextGame, buildScoresByUsername, calculateNextPlayerIndex, calculateScores, changeTurn, createMultipleCards, createRandomCard, dealCards,formatDealtCards,getCurrentPlayerId, mapToKeyValue, omitField, pickRequiredFields, pushToArrayField, removeFromArrayField, selectField, toDefault, updateField, verifyWinner } from "../../domain/helpers/helpers.js";
import { Card } from "../../domain/models/Card.js";
import { Game } from "../../domain/models/Game.js";
import { User } from "../../domain/models/User.js";
import { validateRequiredFields, toResponse, validateAtLeastOneField, isCreator, everyPlayerReady, validateGameInProgress, isPlayerInGame, extractArrayField, isValidCardPlay, isOnHand, validateOnlyOneCard, didNotSayUno, verifyTurn, validateTopCardId } from "../../domain/validators/schemaValidators.js";
import { recover, validateIdExistence, validateNoIdInData } from "../../domain/validators/sharedValidators.js";
import { AsyncEither } from "../../shared/monads/AsyncEither.js";
import { Either } from "../../shared/monads/Either.js";
import { liftEither} from "../../shared/monads/Lifts.js";
import { createCardService, getCardByIdService } from "./cardService.js";
import { getUserByIdService, getUserByUsernameService, partiallyUpdateUserByIdService, updateUserByIdService } from "./userService.js";



export function createGameService(gameRepository, cardRepository) {
    return function (data) {
        const card = createRandomCard();
        return AsyncEither.of(data)
            .map(toDefault(Game))
            .flatMap(liftEither(validateRequiredFields(Game)))
            .map(updateField("playersIds", [data.userId]))
            .map(updateField("creatorId", data.userId))
            .flatMap(game =>
                AsyncEither.of(card)
                    .flatMap(createCardService(cardRepository))
                    .flatMap(card => 
                        AsyncEither.of(game)
                            .map(updateField("topCard", card._id))
                    )
            )
            .map(toResponse(Game))
            .flatMap(gameRepository.create)
    }
}

export function getGameByIdService(gameRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(gameRepository.getById)
            .map(toResponse(Game))
        
    };
}

export function updateGameByIdService(gameRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateRequiredFields(Game)))
            .flatMap(gameRepository.updateById(data.id))
            .map(toResponse(Game));
    }
}

export function partiallyUpdateGameByIdService(gameRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(liftEither(validateNoIdInData))
            .flatMap(liftEither(validateAtLeastOneField))
            .flatMap(gameRepository.updateById(data.id))
            .map(toResponse(Game));
    }
}

export function deleteGameByIdService(gameRepository){
    return function(data){
        return AsyncEither.of(data.id)
            .flatMap(liftEither(validateIdExistence))
            .flatMap(gameRepository.deleteById)
            .map(toResponse(Game));
    }
}

export function joinGameService(gameRepository, userRepository, tokenService){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(tokenService.verifyToken)
            .flatMap(getUserByUsernameService(userRepository))
            .map(selectField("_id"))
            .flatMap(userId =>
                AsyncEither.of({id: data.gameId})
                    .flatMap(getGameByIdService(gameRepository))
                    .flatMap(liftEither(pushToArrayField("playersIds", userId)))
                    .flatMap(gameRepository.updateById(data.gameId))
            )
    }
}

export function startGameService(gameRepository, userRepository, tokenService){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(tokenService.verifyToken)
            .flatMap(getUserByUsernameService(userRepository))
            .map(selectField("_id"))
            .flatMap(userId =>
                AsyncEither.of({id: data.gameId})
                    .flatMap(getGameByIdService(gameRepository))
                    .flatMap(liftEither(isCreator(userId)))
                    .flatMap(getGamePlayers(userRepository))
                    .flatMap(liftEither(everyPlayerReady))
                    .map(updateField("status", "IN_PROGRESS"))
                    .flatMap(gameRepository.updateById(data.gameId))
            )
    }
}

export function leaveGameService(gameRepository, userRepository, tokenService) {
    return function(data) {
        return AsyncEither.of(data)
            .flatMap(tokenService.verifyToken)
            .flatMap(getUserByUsernameService(userRepository))
            .map(selectField("_id"))
            .flatMap(userId =>
                AsyncEither.of({id: data.gameId})
                    .flatMap(getGameByIdService(gameRepository))
                    .flatMap(liftEither(validateGameInProgress))
                    .flatMap(liftEither(isPlayerInGame(userId)))
                    .flatMap(liftEither(removeFromArrayField("playersIds", userId)))
                    .flatMap(gameRepository.updateById(data.gameId))
            )
    };
}

export function endGameService(gameRepository, userRepository, tokenService){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(tokenService.verifyToken)
            .flatMap(getUserByUsernameService(userRepository))
            .map(selectField("_id"))
            .flatMap(userId =>
                AsyncEither.of({id: data.gameId})
                    .flatMap(getGameByIdService(gameRepository))
                    .flatMap(liftEither(validateGameInProgress))
                    .flatMap(liftEither(isCreator(userId)))
                    .map(updateField("status", "FINISHED"))
                    .flatMap(gameRepository.updateById(data.gameId))
            )
    }
}

export function getPlayersNamesService(userRepository, gameRepository){
    return function(data){
        return AsyncEither.of({id: data.gameId})
            .flatMap(getGameByIdService(gameRepository))
            .flatMap(getGamePlayers(userRepository))
            .flatMap(liftEither(extractArrayField("username")))
    }
}

export function getCurrentPlayerService(userRepository, gameRepository){
    return function(data){
        return AsyncEither.of({id: data.gameId})
            .flatMap(getGameByIdService(gameRepository))
            .map(getCurrentPlayerId)
            .flatMap(userId =>
                AsyncEither.of({id: userId})
                    .flatMap(getUserByIdService(userRepository))
            );
    }
}

export function getTopCardService(gameRepository, cardRepository){
    return function(data){
        return AsyncEither.of({id: data.gameId})
            .flatMap(getGameByIdService(gameRepository))
            .map(selectField("topCard"))
            .flatMap(cardId =>
                AsyncEither.of({id: cardId})
                    .flatMap(getCardByIdService(cardRepository))   
            )
    }
}

export function getAllScoresService(gameRepository, userRepository, scoreRepository) {
    return function(data) {
        return AsyncEither.of({ id: data.gameId })
            .flatMap(getGameByIdService(gameRepository))
            .map(selectField("_id"))
            .flatMap(scoreRepository.getByGameId)
            .flatMap(scores =>
                AsyncEither.of(scores)
                    .flatMap(liftEither(extractArrayField("userId")))
                    .flatMap(userRepository.getByIds)
                    .map(users => buildScoresByUsername(scores, users))
            );
    };
}

export function getGamePlayers(userRepository) {
    return function (game) {
        return AsyncEither.of(game.playersIds)
            .flatMap(userRepository.getByIds)
    };
}

export function dealCardsService(userRepository, cardRepository) {
    return function (data) {
        return AsyncEither.of(data.players.length * data.cardsPerPlayer)
            .map(createMultipleCards)
            .flatMap(cardRepository.createMultiple)
            .flatMap(liftEither(extractArrayField("_id")))
            .flatMap(cardsIds =>
                AsyncEither.of(data.players)
                    .flatMap(userRepository.getUsersByUsername)
                    .map(dealCards(cardsIds))
                    .flatMap(updatedPlayers =>
                        AsyncEither.of(updatedPlayers)
                            .flatMap(liftEither(extractArrayField("_id")))
                            .flatMap(playersIds =>
                                AsyncEither.of(updatedPlayers)
                                    .flatMap(userRepository.updateMultiple(playersIds))
                                    .flatMap(getPlayersHandsService(cardRepository))
                                    .map(formatDealtCards)
                            )
                    )
            );
    };
}

export function getPlayersHandsService(cardRepository) {
    return function(players) {
        const allCardIds = players.flatMap(player => player.hand);
        return AsyncEither.of(allCardIds)
            .flatMap(cardRepository.getByIds)
            .map(cards => attachHandCards(players, cards));
    };
}

export function getPlayerHandService(cardRepository){
    return function(player){
        return AsyncEither.of(player)
            .map(selectField("hand"))
            .flatMap(cardRepository.getByIds)

    }
}

export function getHandByUsernameService(cardRepository, userRepository){
    return function(data){
        return AsyncEither.of({username: data.player})
            .flatMap(getUserByUsernameService(userRepository))
            .flatMap(getPlayerHandService(cardRepository))
            .map(cards => 
                cards.map(card => `${card.color} ${card.type} ${card.value}`)
            )
    }
}

export function playCardService(gameRepository, userRepository, cardRepository){
    return function(data){
        return AsyncEither.of({username: data.player})
            .flatMap(getUserByUsernameService(userRepository))
            .flatMap(user =>
                AsyncEither.of(user)
                    .map(selectField("_id"))
                    .flatMap(getGameByUserIdService(gameRepository))
                    .flatMap(game =>
                        AsyncEither.of(game)
                            .flatMap(liftEither(verifyTurn(user)))
                            .map(selectField("topCard"))
                            .flatMap(topCardId => 
                                AsyncEither.of({id: topCardId})
                                    .flatMap(getCardByIdService(cardRepository))
                                    .flatMap(topCard =>
                                        AsyncEither.of(user)
                                            .flatMap(getPlayerHandService(cardRepository))
                                            .flatMap(liftEither(isOnHand(data.cardPlayed)))
                                            .flatMap(result =>
                                                AsyncEither.of(result.playedCard)
                                                    .flatMap(liftEither(isValidCardPlay(topCard)))
                                                    .flatMap(() => AsyncEither.of(result))
                                            )
                                            .flatMap(result =>
                                                AsyncEither.of({hand: result.updatedHand})
                                                    .flatMap(userRepository.updateById(user._id))
                                                    .flatMap(() =>resolveCardEffectService(gameRepository, userRepository, cardRepository)({
                                                            game,
                                                            playedCard: result.playedCard,
                                                            chosenColor: data.chosenColor
                                                        })
                                                    )
                                            )
                                    )
                            )
                    )
            )
    }
}


export function resolveCardEffectService(gameRepository, userRepository, cardRepository){
    return function({game, playedCard, chosenColor}){
        return AsyncEither.of(applyCardEffect(game, playedCard, chosenColor))
            .flatMap(effectData =>
                AsyncEither.of(effectData.cardsToDraw > 0 ?game.playersIds[calculateNextPlayerIndex(game)]
                    : null)
                .flatMap(drawTargetId =>
                    AsyncEither.of((effectData.newTopCard && effectData.newTopCard._id) ? effectData.newTopCard._id : (playedCard && playedCard._id) ? playedCard._id : null)
                    .flatMap(liftEither(validateTopCardId))
                    .flatMap(topCardId =>
                        AsyncEither.of({ color: effectData.newTopCard.color })
                            .flatMap(cardRepository.updateById(topCardId))
                            .flatMap(() =>
                                AsyncEither.of({id: game._id, topCard: topCardId})
                                    .flatMap(partiallyUpdateGameByIdService(gameRepository))
                            )
                            .flatMap(() => AsyncEither.of(buildNextGame(game, effectData)))
                            .flatMap(nextGame =>
                                AsyncEither.of(nextGame)
                                    .map(omitField('_id'))
                                    .flatMap(gameRepository.updateById(nextGame._id))
                            )
                            .flatMap(updatedGame =>
                                effectData.cardsToDraw > 0?
                                AsyncEither.of(effectData.cardsToDraw)
                                        .map(createMultipleCards)
                                        .flatMap(cardRepository.createMultiple)
                                        .flatMap(drawnCards => AsyncEither.of(drawnCards.map(c => c._id)))
                                        .flatMap(cardIds =>
                                            AsyncEither.of(drawTargetId)
                                                .flatMap(userRepository.getById)
                                                .flatMap(targetUser =>
                                                    AsyncEither.of({ hand: (targetUser.hand || []).concat(cardIds) })
                                                        .flatMap(userRepository.updateById(targetUser._id))
                                                        .map(() => ({
                                                            playedCard,
                                                            nextPlayerId: updatedGame.playersIds[updatedGame.turnIndex],
                                                            drawTargetId: targetUser._id,
                                                            drawnCardsCount: cardIds.length,
                                                            effectData,
                                                            updatedGame
                                                        }))
                                                )
                                        )
                                    : AsyncEither.of({
                                        playedCard,
                                        nextPlayerId: updatedGame.playersIds[updatedGame.turnIndex],
                                        effectData,
                                        updatedGame
                                    })
                            )
                    )
                )
            )
    }
}
export function getGameByUserIdService(gameRepository){
    return function(userId){
        return AsyncEither.of(userId)
            .flatMap(gameRepository.getGameByUserId)
    }
}

export function drawCardService(gameRepository, userRepository, cardRepository){
    return function(data){
        return AsyncEither.of({player: data.player,number: 1})
        .flatMap(drawMultipleCardsService(gameRepository, userRepository, cardRepository))
        .map(result => ({nextPlayer: result.nextPlayer,drawnCard: result.drawnCards[0]}))
    }
}

export function drawMultipleCardsService(gameRepository, userRepository, cardRepository) {
    return function (data) {
        return AsyncEither.of(data.number)
            .map(createMultipleCards)
            .flatMap(cardRepository.createMultiple)
            .flatMap(liftEither(extractArrayField("_id")))
            .flatMap(cardIds =>
                AsyncEither.of({username: data.player})
                    .flatMap(getUserByUsernameService(userRepository))
                    .flatMap(user =>
                        AsyncEither.of({ hand: (user.hand || []).concat(cardIds) })
                            .flatMap(userRepository.updateById(user._id))
                            .map(selectField("_id"))
                            .flatMap(getGameByUserIdService(gameRepository))
                            .flatMap(game =>
                                AsyncEither.of(game)
                                    .flatMap(liftEither(verifyTurn(user)))   
                            )
                            .map(changeTurn)
                            .flatMap(game =>
                                AsyncEither.of(game)
                                    .flatMap(gameRepository.updateById(game._id))
                                    .map(game => game.playersIds[game.turnIndex])
                                    .flatMap(nextPlayerId =>
                                        AsyncEither.of({ id: nextPlayerId })
                                            .flatMap(getUserByIdService(userRepository))
                                            .map(selectField("username"))
                                            .flatMap(nextUsername =>
                                                AsyncEither.of(cardIds)
                                                    .flatMap(cardRepository.getByIds)
                                                    .map(cards => ({
                                                        nextPlayer: nextUsername,
                                                        drawnCards: cards
                                                    }))
                                            )
                                    )
                            )
                    )
            )
    };
}

export function sayUnoService(userRepository){
    return function(data){
        return AsyncEither.of({username: data.player})
            .flatMap(getUserByUsernameService(userRepository))
            .flatMap(liftEither(validateOnlyOneCard))
            .map(updateField("saidUno", true))
            .flatMap(user =>
                AsyncEither.of({saidUno: user.saidUno})
                    .flatMap(userRepository.updateById(user._id))
            )
    }
}
export function challengePlayerService(gameRepository, userRepository, cardRepository){
    return function(data){
        const numberOfCards = 2;
        return AsyncEither.of({ username: data.challengedPlayer })
            .flatMap(getUserByUsernameService(userRepository))
            .flatMap(user =>
                AsyncEither.of(user)
                    .flatMap(liftEither(validateOnlyOneCard))
                    .flatMap(liftEither(didNotSayUno))
                    .flatMap(result =>
                        AsyncEither.of({ player: user.username, number: numberOfCards })
                        .flatMap(drawMultipleCardsService(gameRepository, userRepository, cardRepository))
            )
        )
    }
}

export function handlePlayCardService(gameRepository, userRepository, cardRepository, scoreRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(playCardService(gameRepository, userRepository, cardRepository))
            .flatMap(result =>
                AsyncEither.of({ username: data.player })
                    .flatMap(getUserByUsernameService(userRepository))
                    .map(selectField("_id"))
                    .flatMap(getGameByUserIdService(gameRepository))
                    .flatMap(game =>
                        AsyncEither.of(game)
                            .flatMap(liftEither(pushToArrayField("history", {player: data.player,action: `played ${result.playedCard.color} ${result.playedCard.value} ${result.playedCard.type}`})))
                            .flatMap(gameRepository.updateById(game._id))
                            .flatMap(updatedGame =>
                                AsyncEither.of(updatedGame)
                                    .flatMap(findWinnerService(userRepository, cardRepository, scoreRepository))
                                    .flatMap(winner => !winner?
                                        AsyncEither.of({message: `${data.player} played ${result.playedCard ? `${result.playedCard.color} ${result.playedCard.value}` : 'a card'}. Turn ended.`})
                                        : AsyncEither.of({gameId: updatedGame._id})
                                            .flatMap(getAllScoresService(gameRepository, userRepository, scoreRepository))
                                            .map(scores =>({message: `${winner.username} has won the game!`,scores}))
                                    )
                            )
                    )
            )
    }
}

export function handleDrawCardService(gameRepository, userRepository, cardRepository){
    return function(data){
        return AsyncEither.of(data)
            .flatMap(drawCardService(gameRepository, userRepository, cardRepository))
            .flatMap(newCard =>
                AsyncEither.of({ username: data.player })
                    .flatMap(getUserByUsernameService(userRepository))
                    .map(selectField("_id"))
                    .flatMap(getGameByUserIdService(gameRepository))
                    .flatMap(game =>
                        AsyncEither.of(game)
                            .flatMap(liftEither(pushToArrayField("history", {player: data.player,action: "drew a card"})))
                            .flatMap(gameRepository.updateById(game._id))
                            .map(() => ({message: `${data.player} drew a card Turn ended`}))
                            
                    )
            );
    }
}

export function findWinnerService(userRepository, cardRepository, scoreRepository){
    return function(game){
        return AsyncEither.of(game)
            .flatMap(getGamePlayers(userRepository))
            .flatMap(getPlayersHandsService(cardRepository))
            .flatMap(hands =>
                AsyncEither.of(hands)
                    .map(verifyWinner)
                    .flatMap(winner => !winner ? AsyncEither.of(null)
                          : AsyncEither.of(hands.map(p => ({ ...p, gameId: game._id })))
                              .map(calculateScores)
                              .flatMap(scoreRepository.createMultiple)
                              .map(() => winner)
                    )
            )
    }
}

export function getGameStateService(gameRepository, userRepository, cardRepository){
    return function(data){
        return AsyncEither.of({ id: data.gameId })
            .flatMap(getGameByIdService(gameRepository))
            .flatMap(game =>
                AsyncEither.of(game)
                    .flatMap(getGamePlayers(userRepository))
                    .flatMap(getPlayersHandsService(cardRepository))
                    .flatMap(players =>
                        AsyncEither.of({ gameId: game._id })
                            .flatMap(getTopCardService(gameRepository, cardRepository))
                            .flatMap(topCard =>
                                AsyncEither.of({ gameId: game._id })
                                    .flatMap(getGameHistoryService(gameRepository))
                                    .map(history => (buildGameState(game, players, topCard, history)))
                            )
                    )
            )
    }
}
export function getGameHistoryService(gameRepository){
    return function(data){
        return AsyncEither.of({id: data.gameId })
            .flatMap(getGameByIdService(gameRepository))
            .map(selectField("history"))
    };
}

export function getNextPlayerService(gameRepository, userRepository){
    return function(data){
        return AsyncEither.of({id: data.gameId })
            .flatMap(getGameByIdService(gameRepository))
            .flatMap(game => 
                AsyncEither.of(game)
                .map(calculateNextPlayerIndex)
                .flatMap(index => 
                    AsyncEither.of({id: game.playersIds[index]})
                        .flatMap(getUserByIdService(userRepository))
                        .map(user =>
                        ({nextPlayerId: index,username: user.username})
                    )
                )
            )
    }
}
