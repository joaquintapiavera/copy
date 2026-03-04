import { Either } from "../../shared/monads/Either.js";
import {v4 as uuid} from 'uuid';
import { turnGenerator } from "../generators/turnGenerator.js";

export function toDefault(schema) {
    return function(data){
        const result = { ...(data) };
        Object.entries(schema).forEach(([field, meta]) => {
            if (result[field] == null && meta.hasOwnProperty("default")) {
                result[field] = typeof meta.default === "function"? meta.default()
                : meta.default;
            }
        });
        return result;
    }
}

export function mapSession(data){
    return {
        token: data.token,
        userId: data._id,
        revoked: false,
    }
}

export function updateField(field, value) {
    return function(data) {
        return {...data, [field]: value };
    };
}

export function selectField(field) {
    return function(data) {
        return data[field];
    };
}

export function pickRequiredFields(schema) {
    return function(data) {
        return Object.entries(schema)
            .filter(([field, meta]) => meta.required)
            .reduce((acc, [field]) => {
                if (field in data) acc[field] = data[field];
                return acc;
            }, {});
    };
}


export function createRandomCard() {
    const colors = ['RED', 'YELLOW', 'GREEN', 'BLUE'];
    const actions = ['SKIP', 'REVERSE', 'DRAW_TWO'];
    const wilds = ['WILD', 'WILD_DRAW_FOUR'];

    const probability = Math.random();
    let _id = uuid();
    let type;
    let color;
    let value;

    if (probability < 0.75) {
        type = 'NUMBER';
        color = colors[Math.floor(Math.random()*colors.length)];
        value = Math.floor(Math.random() * 10);
    } else if (probability < 0.95) {
        const action = actions[Math.floor(Math.random()*actions.length)];
        type = action;
        color = colors[Math.floor(Math.random()*colors.length)];
        value = -1;
    } else {
        const wild = wilds[Math.floor(Math.random()*wilds.length)];
        type = wild;
        color = 'BLACK';
        value = -1;
    }
    return {_id, type, color, value };
}

export function pushToArrayField(field, value) {
    return function (data) {
        const array = data[field];
        return array.includes(value)? Either.left('Already in')
            : Either.right({
                ...data,
                [field]: [...array, value]
            })
    };
}
export function removeFromArrayField(field, value) {
    return function (data) {

        const array = data[field];
        return array.includes(value)
            ? Either.right({
                ...data,
                [field]: array.filter(item => item !== value)
            })
            : Either.left('Not found');
    };
}

export function allPlayersReady(users) {
    return users.length > 0 && users.every(user => user.isReady === true);
}


export function getCurrentPlayerId(game){
    return game.playersIds[game.turnIndex];
}

export function mapToKeyValue(key, value) {
    return function(elements) {
        return elements.reduce((accumulator, element) => {
            accumulator[element[key]] = element[value];
            return accumulator;
        }, {});
    }
}


export function createMultipleCards(quantity) {
    if (quantity <= 0) {
        return [];
    }
    return [createRandomCard(), ...createMultipleCards(quantity-1)];
}

export function dealCards(cardsIds){
    return function(players){
        function distribute(cards, updatedPlayers, playerIndex){
            if(cards.length === 0){
                return updatedPlayers
            }
            const [currentCard, ...restCards] = cards
            const nextPlayers = updatedPlayers.map((player, index) => {
                if(index === playerIndex){
                    return {...player,hand: [...player.hand, currentCard]}
                }
                return player
            })
            const nextIndex = (playerIndex + 1) % updatedPlayers.length
            return distribute(restCards, nextPlayers, nextIndex)
        }
        return distribute(cardsIds, players, 0)
    }
}

export function changeTurn(game) {
    if (game.playersIds.length === 0) return game;
    const newIndex = calculateNextPlayerIndex(game)
    return {
        ...game,
        turnIndex: newIndex
    };
}
export function calculateNextPlayerIndex(game){
    console.log(turnGenerator(game).next().value)
    if (game.playersIds.length === 0) return 0;
    return turnGenerator(game).next().value;
}


export function verifyWinner(hands){
    return hands.find(player => player.hand.length === 0) || null;
}

export function calculateScores(hands, index = 0, accumulator = []){
    if (index === hands.length) return accumulator;
    const player = hands[index];
    const score = sumHand(player.handCards);
    return calculateScores(hands, index + 1,[...accumulator,{
                _id: uuid(),
                userId: player._id,
                gameId: player.gameId,
                value: score
            }
        ]
    );
}

export function getCardValue(card){
    if (card.type === 'NUMBER') return card.value;
    if (card.type === 'SKIP'||card.type === 'REVERSE'|| card.type === 'DRAW_TWO') return 20;
    if (card.type === 'WILD' ||card.type === 'WILD_DRAW_FOUR') return 50;
    return 0;
}

export function sumHand(handCards, index = 0){
    if (index === handCards.length) return 0;
    return getCardValue(handCards[index]) + sumHand(handCards, index + 1);
}

export function buildGameState(game, players, topCard, history){
    return {
        currentPlayer: players[game.turnIndex].username,
        topCard: `${topCard.color} ${topCard.type} ${topCard.value}`,
        hands: players.reduce((accumulator, player) => {accumulator[player.username] = player.handCards.map(card =>
                    `${card.color} ${card.type} ${card.value}`
                )
            return accumulator
        }, {}),
        turnHistory: history
    }
}

export function buildScoresByUsername(scores, users) {
    const userMap = mapToKeyValue("_id", "username")(users);
    return scores.reduce((accumulator, score) => {accumulator[userMap[score.userId]] = score.value;
        return accumulator;
    }, {});
}

export function attachHandCards(players, cards) {
    const cardsById = cards.reduce((map, card) => {
        map[card._id] = card;
        return map;
    }, {});

    return players.map(player => {
        const handCards = player.hand.map(id => cardsById[id]).filter(card => card != null);
        return { ...player, handCards };
    });
}

export function formatDealtCards(players) {
    const formatCard = card => `${card.color} ${card.type} ${card.value}`;
    const playersHands = players.reduce((accumulator, player) => {
        accumulator[player.username] = player.handCards.map(formatCard);
        return accumulator;
    }, {});
    return playersHands;
}

export function applyCardEffect(game, playedCard, chosenColor) {
    const newTopCard = { ...playedCard };
    let cardsToDraw = 0;
    let turnAdvance = 1;
    let reverseDirection = false;
    switch (playedCard.type) {
        case "REVERSE":
            reverseDirection = true;
            break;

        case "SKIP":
            turnAdvance = 2;
            break;

        case "DRAW_TWO":
            cardsToDraw = 2;
            turnAdvance = 2;
            break;

        case "WILD":
            if (chosenColor) {
                newTopCard.color = chosenColor;
            }
            break;

        case "WILD_DRAW_FOUR":
            cardsToDraw = 4;
            turnAdvance = 2;
            if (chosenColor) {
                newTopCard.color = chosenColor;
            }
            break;
    }

    return {
        newTopCard,
        cardsToDraw,
        turnAdvance,
        reverseDirection
    };
}

export function verifyTurn(game){
    return function(user){
        return game.playersIds[game.turnIndex] === user._id
    }
}

export function omitField(field) {
    return function(data) {
        const {[field]: _, ...rest } = data;
        return rest;
    };
}

export function buildNextGame(game, effectData) {
    const newClockwise = effectData.reverseDirection? !game.clockwise
    :game.clockwise;
    const turnsToAdvance = effectData.turnAdvance || 1;
    const updatedGame = {
        ...game,
        topCard: effectData.newTopCard,
        clockwise: newClockwise
    };
    const steps = Array(turnsToAdvance).fill(null);
    return steps.reduce((currentGame) => changeTurn(currentGame),updatedGame);
}

export function normalizeEndpoint(url) {
    if (!url) return "";
    const segments = url.split("/");
    const normalized = segments.map((segment) =>{
        if(segment.match(/^[0-9a-f-]{36}$/i)) return ":id"
        return segment;
    })
    return normalized.join("/")
}

export function calculateRequestStats(tracks) {
    const breakdown = {}
    tracks.forEach((track) =>{
        const endpoint = normalizeEndpoint(track.endpointAccess);
        const method = track.requestMethod
        if(!breakdown[endpoint]){
            breakdown[endpoint] ={}
        }
        if(!breakdown[endpoint][method]){
            breakdown[endpoint][method] = 0
        }
        breakdown[endpoint][method] += 1;
    })
    return {total_requests: tracks.length, breakdown: breakdown};
}

export function calculateResponseTimes(tracks) {
    const breakdown ={};
    tracks.forEach((track) =>{
        const endpoint = normalizeEndpoint(track.endpointAccess);
        const responseTime = track.responseTime
        if(!breakdown[endpoint]){
            breakdown[endpoint] ={sum: 0, count:0,  min: responseTime, max: responseTime}
        }
        breakdown[endpoint].sum += responseTime;
        breakdown[endpoint].count += 1;
        if (responseTime < breakdown[endpoint].min) {
            breakdown[endpoint].min = responseTime;
        }
        if (responseTime > breakdown[endpoint].max) {
            breakdown[endpoint].max = responseTime;
        }
    })
    const result = {};
    Object.keys(breakdown).forEach(endpoint => {
        result[endpoint] = {
            avg: breakdown[endpoint].sum/breakdown[endpoint].count,
            min: breakdown[endpoint].min,
            max: breakdown[endpoint].max
        };
    });
    return result;
}

export function calculateStatusCodes(tracks) {
    return tracks.reduce((accumulator, track) =>{
        const statusCode = track.statusCode;
        if (!accumulator[statusCode]){
            accumulator[statusCode] = 0;
        }
        accumulator[statusCode] += 1;
        return accumulator;
    }, {});
}

export function calculateMostPopularEndpoint(tracks) {
    const counts = tracks.reduce((accumulator, track) =>{
        const endpoint = normalizeEndpoint(track.endpointAccess);
        if (!accumulator[endpoint]){
            accumulator[endpoint] = 0;
        }
        accumulator[endpoint] += 1;
        return accumulator;
    }, {});

    let maxCount = 0;
    let mostPopular = null;

    Object.keys(counts).forEach((endpoint) => {
        if (counts[endpoint] > maxCount) {
            maxCount = counts[endpoint];
            mostPopular = endpoint;
        }
    });

    return {most_popular: mostPopular, request_count: maxCount};
}

