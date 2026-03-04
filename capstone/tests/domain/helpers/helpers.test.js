import * as helpers from "../../../src/domain/helpers/helpers.js";
import { Either } from "../../../src/shared/monads/Either.js";

describe("helpers unit tests", () => {
    describe("toDefault", () => {
        test("applies default values for missing fields", () => {
            const schema = {
                name: { default: "Pedro" },
                age: { default: 30 },
                active: { default: false }
            };
            const data = { name: "Pancho" };
            const result = helpers.toDefault(schema)(data);
            expect(result).toEqual({ name: "Pancho", age: 30, active: false });
        });

        test("does not override existing values", () => {
            const schema = { name: { default: "Pedro" } };
            const data = { name: "Pancho" };
            const result = helpers.toDefault(schema)(data);
            expect(result).toEqual({ name: "Pancho" });
        });

        test("handles function defaults", () => {
            const schema = {
                id: { default: () => "999" }
            };
            const data = {};
            const result = helpers.toDefault(schema)(data);
            expect(result).toEqual({ id: "999" });
        });

        test("returns same data if no defaults", () => {
            const schema = { name: { type: "string" } };
            const data = { name: "Pancho" };
            const result = helpers.toDefault(schema)(data);
            expect(result).toEqual({ name: "Pancho" });
        });

        test("handles empty data", () => {
            const schema = { name: { default: "Pedro" } };
            const result = helpers.toDefault(schema)({});
            expect(result).toEqual({ name: "Pedro" });
        });
    });

    describe("mapSession", () => {
        test("maps user data to session", () => {
            const data = { _id: "123", token: "validToken" };
            const result = helpers.mapSession(data);
            expect(result).toEqual({
                token: "validToken",
                userId: "123",
                revoked: false
            });
        });

        test("works with additional fields", () => {
            const data = { _id: "123", token: "validToken", extra: "ignored" };
            const result = helpers.mapSession(data);
            expect(result).toEqual({
                token: "validToken",
                userId: "123",
                revoked: false
            });
        });
    });

    describe("updateField", () => {
        test("updates a field with new value", () => {
            const data = { name: "Pancho", age: 25 };
            const result = helpers.updateField("age", 30)(data);
            expect(result).toEqual({ name: "Pancho", age: 30 });
        });

        test("adds field if not present", () => {
            const data = { name: "Pancho" };
            const result = helpers.updateField("age", 30)(data);
            expect(result).toEqual({ name: "Pancho", age: 30 });
        });

        test("returns new object (immutable)", () => {
            const data = { name: "Pancho" };
            const result = helpers.updateField("name", "Fulano")(data);
            expect(result).not.toBe(data);
            expect(result).toEqual({ name: "Fulano" });
        });
    });

    describe("selectField", () => {
        test("returns the value of the field", () => {
            const data = { name: "Pancho", age: 25 };
            const result = helpers.selectField("age")(data);
            expect(result).toBe(25);
        });

        test("returns undefined if field missing", () => {
            const data = { name: "Pancho" };
            const result = helpers.selectField("age")(data);
            expect(result).toBeUndefined();
        });
    });

    describe("pickRequiredFields", () => {
        const schema = {
            name: {required: true},
            age: {required: true},
            email: {required: false }
        };

        test("picks only required fields that exist", () => {
            const data = { name: "Pancho", age: 25, email: "a@b.com" };
            const result = helpers.pickRequiredFields(schema)(data);
            expect(result).toEqual({ name: "Pancho", age: 25 });
        });

        test("does not include missing required fields", () => {
            const data = { name: "Pancho" };
            const result = helpers.pickRequiredFields(schema)(data);
            expect(result).toEqual({ name: "Pancho" });
        });

        test("returns empty object if no required fields present", () => {
            const data = { email: "a@b.com" };
            const result = helpers.pickRequiredFields(schema)(data);
            expect(result).toEqual({});
        });
    });

    describe("createRandomCard", () => {
        test("returns an object with type, color, value", () => {
            const card = helpers.createRandomCard();
            expect(card).toHaveProperty("type");
            expect(card).toHaveProperty("color");
            expect(card).toHaveProperty("value");
        });

        test("type is one of NUMBER, SKIP, REVERSE, DRAW_TWO, WILD, WILD_DRAW_FOUR", () => {
            const card = helpers.createRandomCard();
            const validTypes = ["NUMBER", "SKIP", "REVERSE", "DRAW_TWO", "WILD", "WILD_DRAW_FOUR"];
            expect(validTypes).toContain(card.type);
        });

        test("value is between 0-9 for NUMBER, -1 otherwise", () => {
            const card = helpers.createRandomCard();
            if (card.type === "NUMBER") {
                expect(card.value).toBeGreaterThanOrEqual(0);
                expect(card.value).toBeLessThanOrEqual(9);
            } else {
                expect(card.value).toBe(-1);
            }
        });
    });


    describe("pushToArrayField", () => {
        test("adds value to array if not present", () => {
            const data = { players: [1, 2] };
            const result = helpers.pushToArrayField("players", 3)(data);
            expect(result).toEqual(Either.right({ players: [1, 2, 3] }));
        });

        test("returns left if value already in array", () => {
            const data = {
                players: [1, 2]};
            const result = helpers.pushToArrayField("players", 2)(data);
            expect(result).toEqual(Either.left('Already in'));
        });

        test("handles empty array", () => {
            const data = { players: [] };
            const result = helpers.pushToArrayField("players", 1)(data);
            expect(result).toEqual(Either.right({ players: [1] }));
        });

        test("field may be array of strings", () => {
            const data = { ids: ["a"] };
            const result = helpers.pushToArrayField("ids", "b")(data);
            expect(result).toEqual(Either.right({ ids: ["a", "b"] }));
        });
    });

    describe("removeFromArrayField", () => {
        test("removes value from array if present", () => {
            const data = { players: [1, 2, 3] };
            const result = helpers.removeFromArrayField("players", 2)(data);
            expect(result).toEqual(Either.right({ players: [1, 3] }));
        });

        test("returns left if value not in array", () => {
            const data = { players: [1, 2] };
            const result = helpers.removeFromArrayField("players", 3)(data);
            expect(result).toEqual(Either.left('Not found'));
        });

    });

    describe("allPlayersReady", () => {
        test("returns true if all players ready", () => {
            const users = [{ isReady: true }, { isReady: true }];
            expect(helpers.allPlayersReady(users)).toBe(true);
        });

        test("returns false if any player not ready", () => {
            const users = [{ isReady: true }, { isReady: false }];
            expect(helpers.allPlayersReady(users)).toBe(false);
        });

        test("returns false for empty array", () => {
            expect(helpers.allPlayersReady([])).toBe(false);
        });
    });

    describe("getCurrentPlayerId", () => {
        test("returns player id at turnIndex", () => {
            const game = { playersIds: ["a", "b", "c"], turnIndex: 1 };
            expect(helpers.getCurrentPlayerId(game)).toBe("b");
        });

        test("works with turnIndex 0", () => {
            const game = { playersIds: ["a", "b"], turnIndex: 0 };
            expect(helpers.getCurrentPlayerId(game)).toBe("a");
        });

        test("returns undefined if turnIndex out of bounds", () => {
            const game = { playersIds: ["a"], turnIndex: 2 };
            expect(helpers.getCurrentPlayerId(game)).toBeUndefined();
        });
    });

    describe("mapToKeyValue", () => {
        test("maps array of objects to object with key-value pairs", () => {
            const elements = [
                { username: "Pedro", score: 10 },
                { username: "juan", score: 20 }
            ];
            const result = helpers.mapToKeyValue("username", "score")(elements);
            expect(result).toEqual({ Pedro: 10, juan: 20 });
        });

        test("works with different keys", () => {
            const elements = [
                { id: 1, name: "Pancho" },
                { id: 2, name: "Fulano" }
            ];
            const result = helpers.mapToKeyValue("id", "name")(elements);
            expect(result).toEqual({ 1: "Pancho", 2: "Fulano" });
        });

        test("handles empty array", () => {
            const result = helpers.mapToKeyValue("key", "value")([]);
            expect(result).toEqual({});
        });
    });
    describe("createMultipleCards", () => {
        test("returns array of cards with given quantity", () => {
            const cards = helpers.createMultipleCards(3);
            expect(cards).toHaveLength(3);
            cards.forEach(card => {
                expect(card).toHaveProperty('_id');
                expect(card).toHaveProperty('type');
                expect(card).toHaveProperty('color');
                expect(card).toHaveProperty('value');
            });
        });

        test("returns empty array for quantity 0", () => {
            expect(helpers.createMultipleCards(0)).toEqual([]);
        });

        test("returns empty array for negative quantity", () => {
            expect(helpers.createMultipleCards(-1)).toEqual([]);
        });
    });

    describe("dealCards", () => {
        test("distributes cards evenly among players", () => {
            const players = [
                {username: 'joaquin', hand: [] },
                {username: 'pablo', hand: [] },
                {username: 'pedro', hand: [] }
            ];
            const cardIds = ['123', '456', '789', '101', '112', '131'];
            const result = helpers.dealCards(cardIds)(players);
            expect(result).toHaveLength(3);
            expect(result[0].hand).toEqual(['123', '101']);
            expect(result[1].hand).toEqual(['456', '112']);
            expect(result[2].hand).toEqual(['789', '131']);
        });

        test("handles empty cardIds", () => {
            const players = [{ username: 'joaquin', hand: []}];
            const result = helpers.dealCards([])(players);
            expect(result[0].hand).toEqual([]);
        });
    });

    describe("changeTurn", () => {
        test("changes turn to next player, clockwise", () => {
            const game = {playersIds: ['111', '222', '333'], turnIndex: 0};
            const result = helpers.changeTurn(game);
            expect(result.turnIndex).toBe(2);
        });

        test("returns same game if no players", () => {
            const game = { playersIds: [], turnIndex: 0 };
            const result = helpers.changeTurn(game);
            expect(result).toEqual(game);
        });
    });

    describe("verifyWinner", () => {
        test("returns player with empty hand", () => {
            const hands = [
                {username: 'joaquin', hand: ['123']},
                {username: 'pablo', hand: []}
            ];
            expect(helpers.verifyWinner(hands)).toEqual({username: 'pablo', hand: []});
        });

        test("returns null if no player has empty hand", () => {
            const hands = [
                { username: 'joaquin', hand: ['123'] },
                { username: 'pablo', hand: ['456'] }
            ];
            expect(helpers.verifyWinner(hands)).toBeNull();
        });
    });

    describe("getCardValue", () => {
        test("returns numeric value for NUMBER cards", () => {
            expect(helpers.getCardValue({type: 'NUMBER', value: 5})).toBe(5);
        });

        test("returns 20 for action cards", () => {
            const actions = ['SKIP', 'REVERSE', 'DRAW_TWO'];
            actions.forEach(type => {
                expect(helpers.getCardValue({type})).toBe(20);
            });
        });

        test("returns 50 for wild cards", () => {
            const wilds = ['WILD', 'WILD_DRAW_FOUR'];
            wilds.forEach(type => {
                expect(helpers.getCardValue({type})).toBe(50);
            });
        });

        test("returns 0 for unknown type", () => {
            expect(helpers.getCardValue({ type:'UNKNOWN'})).toBe(0);
        });
    });

    describe("sumHand", () => {
        test("sums values of cards in hand", () => {
            const handCards = [
                { type: 'NUMBER', value: 5 },
                { type: 'SKIP' },
                { type: 'WILD' }
            ];
            expect(helpers.sumHand(handCards)).toBe(5 + 20 + 50);
        });

        test("returns 0 for empty hand", () => {
            expect(helpers.sumHand([])).toBe(0);
        });
    });

    describe("calculateScores", () => {
        test("calculates scores for each player", () => {
            const hands = [
                { _id: '123', username: 'joaquin', gameId: '999', handCards: [{ type: 'NUMBER', value: 5 }] },
                { _id: '456', username: 'pablo', gameId: '999', handCards: [{ type: 'SKIP' }] }
            ];
            const scores = helpers.calculateScores(hands);
            expect(scores).toHaveLength(2);
            expect(scores[0]).toMatchObject({
                userId: '123',
                gameId: '999',
                value: 5
            });
            expect(scores[1]).toMatchObject({
                userId: '456',
                gameId: '999',
                value: 20
            });
            expect(scores[0]).toHaveProperty('_id');
            expect(scores[1]).toHaveProperty('_id');
        });

        test("handles empty hands", () => {
            expect(helpers.calculateScores([])).toEqual([]);
        });
    });

    describe("buildGameState", () => {
        test("builds game state object", () => {
            const game = { turnIndex: 1, _id: '999' };
            const players = [
                { username: 'joaquin', handCards: [{ color: 'RED', type: 'NUMBER', value: 5 }] },
                { username: 'pablo', handCards: [] }
            ];
            const topCard = { color: 'BLUE', type: 'SKIP', value: -1 };
            const history = ['player drew a card', 'player played a card'];
            const state = helpers.buildGameState(game, players, topCard, history);
            expect(state).toEqual({
                currentPlayer: 'pablo',
                topCard: 'BLUE SKIP -1',
                hands: {
                    joaquin: ['RED NUMBER 5'],
                    pablo: []
                },
                turnHistory: ['player drew a card', 'player played a card']
            });
        });
    });

    describe("buildScoresByUsername", () => {
        test("maps scores to usernames", () => {
            const scores = [
                { userId: '123', value: 10 },
                { userId: '456', value: 20 }
            ];
            const users = [
                { _id: '123', username: 'joaquin' },
                { _id: '456', username: 'juan' }
            ];
            const result = helpers.buildScoresByUsername(scores, users);
            expect(result).toEqual({ joaquin: 10, juan: 20 });
        });

        test("handles empty arrays", () => {
            expect(helpers.buildScoresByUsername([], [])).toEqual({});
        });
    });
    describe("applyCardEffect", () => {
        test("REVERSE sets reverseDirection true", () => {
            const game = { playersIds: ["123","456"], turnIndex: 0, clockwise: true };
            const playedCard = { type: "REVERSE", color: "YELLOW", value: -1 };
            const effect = helpers.applyCardEffect(game, playedCard, null);
            expect(effect.reverseDirection).toBe(true);
            expect(effect.cardsToDraw).toBe(0);
        });

        test("SKIP advances turn by 2", () => {
            const game = { playersIds: ["123","456","789"], turnIndex: 0 };
            const playedCard = { type: "SKIP", color: "RED", value: -1 };
            const effect = helpers.applyCardEffect(game, playedCard, null);
            expect(effect.turnAdvance).toBe(2);
            expect(effect.cardsToDraw).toBe(0);
        });

        test("DRAW_TWO sets cardsToDraw to 2 and advances turn", () => {
            const game = { playersIds: ["123","456","789"], turnIndex: 0 };
            const playedCard = { type: "DRAW_TWO", color: "GREEN", value: -1 };
            const effect = helpers.applyCardEffect(game, playedCard, null);
            expect(effect.cardsToDraw).toBe(2);
            expect(effect.turnAdvance).toBe(2);
        });

        test("WILD changes color when chosenColor provided", () => {
            const game = {};
            const playedCard = { type: "WILD", color: "BLACK", value: -1 };
            const effect = helpers.applyCardEffect(game, playedCard, "RED");
            expect(effect.newTopCard.color).toBe("RED");
            expect(effect.cardsToDraw).toBe(0);
        });

        test("WILD_DRAW_FOUR sets cardsToDraw and changes color when chosen", () => {
            const game = {};
            const playedCard = { type: "WILD_DRAW_FOUR", color: "BLACK", value: -1 };
            const effect = helpers.applyCardEffect(game, playedCard, "BLUE");
            expect(effect.cardsToDraw).toBe(4);
            expect(effect.turnAdvance).toBe(2);
            expect(effect.newTopCard.color).toBe("BLUE");
        });
    });

    describe("verifyTurn (helpers.verifyTurn)", () => {
        test("returns true when it's the user's turn", () => {
            const game = { playersIds: ["101","121"], turnIndex: 1 };
            const user = { _id: "121" };
            const result = helpers.verifyTurn(game)(user);
            expect(result).toBe(true);
        });

        test("returns false when it's not the user's turn", () => {
            const game = { playersIds: ["101","121"], turnIndex: 0 };
            const user = { _id: "121" };
            const result = helpers.verifyTurn(game)(user);
            expect(result).toBe(false);
        });
    });

    describe("omitField", () => {
        test("removes the provided field from object", () => {
            const data = {field1: 1, field2: 2, field3: 3 };
            const result = helpers.omitField("field2")(data);
            expect(result).toEqual({field1: 1, field3: 3 });
        });

        test("works when field not present (returns same minus nothing)", () => {
            const data = {field1: 1 };
            const result = helpers.omitField("z")(data);
            expect(result).toEqual({field1: 1 });
        });
    });

    describe("buildNextGame", () => {
        test("applies newTopCard and toggles clockwise when reverseDirection true without advancing turns", () => {
            const game = { _id: "141", playersIds: ["516","171"], turnIndex: 0, clockwise: true, topCard: { color: "RED" } };
            const effectData = { newTopCard: { color: "GREEN" }, reverseDirection: true, turnAdvance: 0 };
            const next = helpers.buildNextGame(game, effectData);
            expect(next.topCard).toEqual(effectData.newTopCard);
            expect(next.clockwise).toBe(false);
        });
    });
    describe("normalizeEndpoint", () => {

        test("replaces uuid with :id in urls", () => {
            const uuid = "7730bc29-c0f2-487b-b6f7-0dc180199a0e";
            const url = `/api/users/${uuid}`;
            const normalized = helpers.normalizeEndpoint(url);
            expect(normalized).toBe("/api/users/:id");
        });

        test("does not replace segments that are not uuids", () => {
            const url = "/api/users/123";
            const normalized = helpers.normalizeEndpoint(url);
            expect(normalized).toBe("/api/users/123");
        });

    });

    describe("calculateRequestStats", () => {
        test("calculates the requests stats by normalized endpoint and method", () => {
            const uuid = "7730bc29-c0f2-487b-b6f7-0dc180199a0e";
            const tracks = [
                { endpointAccess: `/api/users/${uuid}`, requestMethod: "GET" },
                { endpointAccess: `/api/users/${uuid}`, requestMethod: "GET" },
                { endpointAccess: "/api/games", requestMethod: "POST" }
            ];

            const result = helpers.calculateRequestStats(tracks);
            expect(result.total_requests).toBe(3);
            expect(result.breakdown["/api/users/:id"].GET).toBe(2);
            expect(result.breakdown["/api/games"].POST).toBe(1);
        });

        test("handles empty tracks array", () => {
            const result = helpers.calculateRequestStats([]);
            expect(result.total_requests).toBe(0);
            expect(result.breakdown).toEqual({});
        });
    });

    describe("calculateResponseTimes", () => {
        test("calculates average min and max for each endpoint", () => {
            const uuid = "7730bc29-c0f2-487b-b6f7-0dc180199a0e";
            const tracks = [
                { endpointAccess: `/api/users/${uuid}`, responseTime: 100 },
                { endpointAccess: `/api/users/${uuid}`, responseTime: 200 },
                { endpointAccess: "/api/games", responseTime: 50 }
            ];

            const result = helpers.calculateResponseTimes(tracks);

            expect(result["/api/users/:id"].avg).toBe(150);
            expect(result["/api/users/:id"].min).toBe(100);
            expect(result["/api/users/:id"].max).toBe(200);
            expect(result["/api/games"].avg).toBe(50);
            expect(result["/api/games"].min).toBe(50);
            expect(result["/api/games"].max).toBe(50);
        });

        test("handles empty tracks array", () => {
            const result = helpers.calculateResponseTimes([]);
            expect(result).toEqual({});
        });
    });

    describe("calculateStatusCodes", () => {
        test("sums the status codes occurrences", () => {
            const tracks = [
                {statusCode: 200},
                {statusCode: 404},
                {statusCode: 200}
            ];
            const result = helpers.calculateStatusCodes(tracks);
            expect(result).toEqual({"200": 2,"404": 1});
        });
    });

    describe("calculateMostPopularEndpoint", () => {
        test("returns most popular endpoint and its count", () => {
            const uuid = "7730bc29-c0f2-487b-b6f7-0dc180199a0e";
            const tracks = [
                { endpointAccess: `/api/users/${uuid}` },
                { endpointAccess: `/api/users/${uuid}` },
                { endpointAccess: "/api/games" }
            ];
            const result = helpers.calculateMostPopularEndpoint(tracks);
            expect(result).toEqual({ most_popular: "/api/users/:id", request_count: 2 });
        });

        test("returns null and 0 when tracks empty", () => {
            const result = helpers.calculateMostPopularEndpoint([]);
            expect(result).toEqual({ most_popular: null, request_count: 0 });
        });
    });
});