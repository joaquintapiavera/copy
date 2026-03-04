import { Either} from "../../shared/monads/Either.js";

export function validateRequiredFields(schema) {
    return function(data) {
        if (!data) return Either.left("No data provided");
        const missing = Object.entries(schema).find(([field, meta]) =>
            meta.required && (data[field] == null)
        );
        return missing ? Either.left(`${missing[0]} is required`) : Either.right(data);
    };
}

export function toResponse(schema) {
    return function (data) {
        if (!data) return data;
        return Object.entries(schema).filter(([field, meta]) => 
            meta.visible
        ).reduce((accumulator, [field]) => {
            accumulator[field] = data[field];
            return accumulator;
        },{});
    };
}

export function validateAtLeastOneField(data) {
    if (!data) return Either.left("No data provided");
    const fieldsToUpdate = Object.keys(data)
    if ((fieldsToUpdate[0] === "id" || fieldsToUpdate[0] === "token") && fieldsToUpdate.length === 1) {
        return Either.left("No fields to update");
    }
    return Either.right(data);
}

export function isCreator(userId){
    
    return function(data){
        if(data.creatorId !== userId) return Either.left('Only creator can start a game')
        return Either.right(data) 
    }
}

export function everyPlayerReady(players) {
    if (!players.length) return Either.left("No players in game");
    if (!players.every(player => player.isReady === true)) return Either.left("Not all players are ready");
    return Either.right(players);
    
}

export function extractArrayField(field) {
    return function(data){
        const array = data.map(element => element[field]);
        return Either.right(array)
    }
}

export function validateGameInProgress(game) {
    if (!game) return Either.left("Game not found");
    if (game.status !== "IN_PROGRESS") return Either.left("Game is not in progress");
    return Either.right(game);
}

export function isPlayerInGame(userId) {
    return function(game) {
        const list = game.playersIds;
        if (!list.includes(userId)) return Either.left("User is not a player in the game");
        return Either.right(game);
    };
}

export function isValidCardPlay(topCard) {
    return function(playedCard){
        if (playedCard.type === 'WILD' || playedCard.type === 'WILD_DRAW_FOUR') {
            return Either.right(playedCard);
        }

        if (playedCard.color === topCard.color) {
            return Either.right(playedCard);
        }

        if (playedCard.type === 'NUMBER' && topCard.type === 'NUMBER' && playedCard.value === topCard.value) {
            return Either.right(playedCard);
        }

        if (playedCard.type === topCard.type && playedCard.type !== 'NUMBER') {
            return Either.right(playedCard);
        }

        return Either.left('Invalid card. Please play a card that matches the top card on the discard pile.');
    }
}

export function isOnHand(cardStr) {
    return function(handCards) {
        return parseCardString(cardStr).flatMap(parsed => {
            const index = handCards.findIndex(c => {
                return (
                    c.color === parsed.color &&
                    c.type === parsed.type &&
                    c.value === parsed.value
                );
            });
            if (index === -1) {
                return Either.left('Card not in hand');
            }
            const [removedCard] = handCards.splice(index, 1);
            return Either.right({playedCard: removedCard,updatedHand: handCards});
        });
    };
}

export function parseCardString(cardStr) {
    if (!cardStr || typeof cardStr !== 'string') {
        return Either.left(`Invalid Card: ${cardStr}`);
    }

    const s = cardStr
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');

    if (s === 'WILD') {
        return Either.right({
            color: 'BLACK',
            type: 'WILD',
            value: -1
        });
    }
    if (s === 'WILD DRAW FOUR'){
        return Either.right({
            color: 'BLACK',
            type: 'WILD_DRAW_FOUR',
            value: -1
        });
    }

    const parts = s.split(' ');
    if (parts.length < 2) {
        return Either.left(`Invalid Card: ${cardStr}`);
    }

    const color = parts[0];
    const inputType = parts.slice(1).join(' ');
    const colors = ['RED', 'YELLOW', 'GREEN', 'BLUE'];
    const numbers = ['0','1','2','3','4','5','6','7','8','9'];
    const actions = ['SKIP', 'REVERSE', 'DRAW TWO'];

    if (!colors.includes(color)) return Either.left(`Invalid color: ${color}`);
    if (numbers.includes(inputType)) {
        return Either.right({
            color,
            type: 'NUMBER',
            value: parseInt(inputType, 10)
        });
    }

    if (inputType === 'DRAW TWO') {
        return Either.right({
            color,
            type: 'DRAW_TWO',
            value: -1
        });
    }

    if (inputType === 'SKIP' || inputType === 'REVERSE') {
        return Either.right({
            color,
            type: inputType,
            value: -1
        });
    }

    return Either.left(`Invalid Card: ${cardStr}`);
}

export function validateOnlyOneCard(user){
    return user.hand.length === 1? Either.right(user)
    : Either.left('More than one card left')
}

export function didNotSayUno(user){
    return user.saidUno? Either.left(`Challenge failed. ${user.username}  said UNO on time.`)
    : Either.right('Challenge successful. Player1 forgot to say UNO and draws 2 cards')
}

export function verifyTurn(user){
    return function(game){
        return game.playersIds[game.turnIndex] === user._id? Either.right(game)
        : Either.left('You must wait for your turn to play')
    }
}

export function validateTopCardId(id){
    return id ? Either.right(id) : Either.left('No topCard id');
}