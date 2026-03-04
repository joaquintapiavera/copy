import { validateRequiredFields, verifyTurn,validateTopCardId , toResponse, validateAtLeastOneField, isCreator, everyPlayerReady, extractArrayField, validateGameInProgress, isPlayerInGame, isValidCardPlay, isOnHand, parseCardString, validateOnlyOneCard, didNotSayUno } from "../../../src/domain/validators/schemaValidators.js";
import { Either } from "../../../src/shared/monads/Either.js";


describe("schemaValidators tests", () => {
    describe("validateRequiredFields", () => {
        const schema = {
            name: { required: true },
            score: { required: true }
        };

        test("returns success with data if all required fields present", () => {
            const data = { name: "joaquin", score: 30 };
            const validator = validateRequiredFields(schema);
            const result = validator(data);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(data);
        });

        test("returns error if data is null", () => {
            const validator = validateRequiredFields(schema);
            const result = validator(null);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("No data provided");
        });

        test("returns error with missing field name if field missing", () => {
            const data = {score: 30};
            const validator = validateRequiredFields(schema);
            const result = validator(data);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("name is required");
        });

        test("returns error with missing field scor", () => {
            const data = { name: "joaquin" };
            const validator = validateRequiredFields(schema);
            const result = validator(data);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("score is required");
        });
    });

    describe("toResponse", () => {
        const schema = {
            name: { visible: true },
            score: { visible: false },
            email: { visible: true }
        };

        test("returns object with only visible fields", () => {
            const data = { name: "joaquin", score: 30, email: "joaquin@gmail.com", extra: "ignored" };
            const formatter = toResponse(schema);
            const result = formatter(data);
            expect(result).toEqual({ name: "joaquin", email: "joaquin@gmail.com" });
        });

        test("returns same data if no schema", () => {
            const formatter = toResponse({});
            const data = { name: "joaquin" };
            const result = formatter(data);
            expect(result).toEqual({});
        });

        test("returns data unchanged if data is null", () => {
            const formatter = toResponse(schema);
            const result = formatter(null);
            expect(result).toBeNull();
        });
    });

    describe("validateAtLeastOneField", () => {
        test("returns success with data if at least one field present", () => {
            const data = { name: "joaquin" };
            const result = validateAtLeastOneField(data);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(data);
        });

        test("returns success with data if multiple fields are present", () => {
            const data = { id: "123", name: "joaquin" };
            const result = validateAtLeastOneField(data);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(data);
        });

        test("returns error if only id field provided", () => {
            const data = { id: "123" };
            const result = validateAtLeastOneField(data);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("No fields to update");
        });

        test("returns error if only token field provided", () => {
            const data = { token: "validToken" };
            const result = validateAtLeastOneField(data);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("No fields to update");
        });

        test("returns error if data is null", () => {
            const result = validateAtLeastOneField(null);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("No data provided");
        });
    });

    describe("isCreator", () => {
        const userId = "123";
        const validator = isCreator(userId);

        test("returns success with data if userId matches creatorId", () => {
            const game = { creatorId: "123", name: "Game" };
            const result = validator(game);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(game);
        });

        test("returns error if userId does not match creatorId", () => {
            const game = { creatorId: "789", name: "Game" };
            const result = validator(game);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Only creator can start a game");
        });
    });

    describe("everyPlayerReady", () => {
        test("returns success with players if all ready", () => {
            const players = [
                { isReady: true },
                { isReady: true }
            ];
            const result = everyPlayerReady(players);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(players);
        });

        test("returns error if not all players ready", () => {
            const players = [
                { isReady: true },
                { isReady: false }
            ];
            const result = everyPlayerReady(players);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not all players are ready");
        });
    });

    describe("extractArrayField", () => {
        const extractor = extractArrayField("username");

        test("returns success with array of field values", () => {
            const players = [
                { username: "Pancho" },
                { username: "Pedro" }
            ];
            const result = extractor(players);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(["Pancho", "Pedro"]);
        });

    });

    describe("validateGameInProgress", () => {
        test("returns success with game if status is IN_PROGRESS", () => {
            const game = { status: "IN_PROGRESS" };
            const result = validateGameInProgress(game);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(game);
        });

        test("returns error if status is not IN_PROGRESS", () => {
            const game = { status: "WAITING" };
            const result = validateGameInProgress(game);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Game is not in progress");
        });
    });

    describe("isPlayerInGame tests", () => {
        const userId = "123";
        const validator = isPlayerInGame(userId);

        test("returns success with game if userId is in playersIds", () => {
            const game = { playersIds: ["123", "456"] };
            const result = validator(game);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(game);
        });

        test("returns error if userId is not in playersIds", () => {
            const game = { playersIds: ["456"] };
            const result = validator(game);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("User is not a player in the game");
        });
    });
    describe("isValidCardPlay", () => {
        test("returns Right if card is wild", () => {
            const card = { type: 'WILD', color: 'BLACK', value: -1};
            const otherCard = { type: 'NUMBER', color: 'RED', value: 5};
            const result = isValidCardPlay(otherCard)(card);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(card);
        });

        test("returns Right if colors match", () => {
            const card = { type: 'NUMBER', color: 'RED', value: 5};
            const otherCard = { type: 'SKIP', color: 'RED', value: -1};
            const result = isValidCardPlay(card)(otherCard);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(otherCard);
        });

        test("returns Right if both numbers and values match", () => {
            const card = { type: 'NUMBER', color: 'RED', value: 5};
            const otherCard = { type: 'NUMBER', color: 'BLUE', value: 5};
            const result = isValidCardPlay(card)(otherCard);
            expect(result.isRight()).toBe(true);
        });

        test("returns Right if both action types match", () => {
            const card = { type: 'SKIP', color: 'RED', value: -1};
            const otherCard = { type: 'SKIP', color: 'BLUE', value: -1};
            const result = isValidCardPlay(card)(otherCard);
            expect(result.isRight()).toBe(true);
        });

        test("returns Left if no match", () => {
            const card = { type: 'NUMBER', color: 'RED', value: 5};
            const otherCard = { type: 'SKIP', color: 'BLUE', value: -1};
            const result = isValidCardPlay(card)(otherCard);
            expect(result.isLeft()).toBe(true);
        });
    });

    describe("parseCardString", () => {
        test("parses number card", () => {
            const result = parseCardString("RED 5");
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual({color: 'RED', type: 'NUMBER', value: 5});
        });

        test("parses action card", () => {
            const result = parseCardString("BLUE SKIP");
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual({color: 'BLUE', type: 'SKIP', value: -1});
        });

        test("parses wild card", () => {
            const result = parseCardString("WILD");
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual({color: 'BLACK', type: 'WILD', value: -1});
        });


        test("returns Left for invalid string", () => {
            const result = parseCardString("INVALID");
            expect(result.isLeft()).toBe(true);
        });
    });

    describe("isOnHand", () => {
        const handCards = [
            {color: 'RED', type: 'NUMBER', value: 5, _id: '123'},
            {color: 'BLUE', type: 'SKIP', value: -1, _id: '456'}
        ];

        test("returns Right with played card and updated hand if card exists", () => {
            const result = isOnHand("RED 5")(handCards);
            expect(result.isRight()).toBe(true);
            expect(result.value).toHaveProperty('playedCard');
            expect(result.value.playedCard).toMatchObject({ color: 'RED', value: 5 });
            expect(result.value.updatedHand).toHaveLength(1);
        });

        test("returns Left if card not in hand", () => {
            const result = isOnHand("GREEN 3")(handCards);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Card not in hand');
        });
    });

    describe("validateOnlyOneCard", () => {
        test("returns Right if hand length is 1", () => {
            const user = { hand: ['123'] };
            const result = validateOnlyOneCard(user);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(user);
        });

        test("returns Left if hand length is not 1", () => {
            const user = { hand: ['123', '456'] };
            const result = validateOnlyOneCard(user);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('More than one card left');
        });
    });

    describe("didNotSayUno", () => {
        test("returns Right if saidUno is false", () => {
            const user = {username: 'juan', saidUno: false};
            const result = didNotSayUno(user);
            expect(result.isRight()).toBe(true);
        });

        test("returns Left if saidUno is true", () => {
            const user = {username: 'juan', saidUno: true};
            const result = didNotSayUno(user);
            expect(result.isLeft()).toBe(true);
        });
    });
    describe("verifyTurn", () => {
        test("returns Right if it is user's turn", () => {
            const user = { _id: "123" };
            const game = { playersIds: ["123", "456"], turnIndex: 0 };

            const result = verifyTurn(user)(game);

            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(game);
        });

        test("returns Left if it is not user's turn", () => {
            const user = { _id: "123" };
            const game = { playersIds: ["456", "123"], turnIndex: 0 };
            const result = verifyTurn(user)(game);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("You must wait for your turn to play");
        });
    });

    describe("validateTopCardId", () => {
        test("returns Right if id exists", () => {
            const result = validateTopCardId("123");
            expect(result.isRight()).toBe(true);
            expect(result.value).toBe("123");
        });

        test("returns Left if id is missing", () => {
            const result = validateTopCardId(null);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("No topCard id");
        });
    });
});