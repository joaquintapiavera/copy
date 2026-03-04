import { createCardService, getCardByIdService, updateCardByIdService, partiallyUpdateCardByIdService, deleteCardByIdService } from "../../../src/application/services/cardService.js";
import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import * as schemaValidators from "../../../src/domain/validators/schemaValidators.js"
import * as sharedValidators from "../../../src/domain/validators/sharedValidators.js"
import * as helpers from "../../../src/domain/helpers/helpers.js";
import { Either } from "../../../src/shared/monads/Either.js";


afterEach(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
  jest.resetModules();
});


describe("card service tests", () => {
    describe("create card tests", ()=> {
        test("creates card with valid data", async() => {
            const card = {
                color:"RED",
                value: 5,
                type: "NUMBER",
            };
            const savedCard ={
                _id: "123",
                color: "RED",
                value: 5,
                type: "NUMBER",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const cardRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");


            cardRepository.create.mockReturnValue(AsyncEither.of(savedCard))
            const service = createCardService(cardRepository);
            const result = await service(card).run();

            expect(cardRepository.create).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value._id).toBe(savedCard._id);
            expect(result.value.color).toBe(savedCard.color);
            expect(result.value.type).toBe(savedCard.type);
        });

        test("Does not create a card if there is no data", async ()=> {
            const card = {
                
            };

            const cardRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createCardService(cardRepository);
            const result = await service(card).run();
            expect(cardRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('color is required');
        });

        test("Does not create a card if required fields are incomplete", async ()=> {
            const card = {
                color: "RED"
            };

            const cardRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createCardService(cardRepository);
            const result = await service(card).run();
            expect(cardRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('value is required');
        });

        test("Does not save additional fields ", async ()=> {
            const card = {
                color: "RED",
                value: 4,
                type: "NUMBER",
                extraField: "something"
            };

            const savedCard ={
                _id: "123",
                color: "RED",
                value: 4,
                type: "NUMBER",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const cardRepository = {
                create: jest.fn()
            };

            cardRepository.create.mockReturnValue(AsyncEither.of(savedCard));


            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");      

            const service = createCardService(cardRepository);
            const result = await service(card).run();
            expect(cardRepository.create).toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value).not.toHaveProperty('extraField');
        });
    });

    describe("get card tests", ()=> {
        test("returns card by id", async() => {
            const id = "123";
            const stored = {
                _id: id,
                color:"RED",
                value: 4,
                type: "NUMBER",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const cardRepository = {
                getById: jest.fn()
            };

            cardRepository.getById.mockReturnValue(AsyncEither.of(stored))

            jest.spyOn(sharedValidators, "validateIdExistence")
            jest.spyOn(schemaValidators, "toResponse");

            const service = getCardByIdService(cardRepository);
            const result = await service({id: id}).run();

            expect(cardRepository.getById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(false);
            expect(result.value._id).toBe(id);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not return data if id is not provided", async () => {
            const cardRepository = {
                getById: jest.fn()
            };

            jest.spyOn(cardRepository, "getById");
            jest.spyOn(sharedValidators, "validateIdExistence")
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getCardByIdService(cardRepository);
            const result = await service({ id: "" }).run();

            expect(cardRepository.getById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('ID required');
        });

        test("does not return data for invalid Id", async () => {
            const cardRepository = {
                getById: jest.fn()
            };

            cardRepository.getById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence")
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getCardByIdService(cardRepository);
            const result = await service({ id: "invalidId" }).run();

            expect(cardRepository.getById).toHaveBeenCalledWith("invalidId");
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('Not found');
        });
    });

    describe("update card tests", () => {
        test("updates card successfully", async () => {
            const id = "123";
            const data = {
                color: "BLUE",
                value: -1,
                type: "DRAW_TWO"
            };
            const updated = {
                _id: id,
                ...data,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const cardRepository = {
                updateById: jest.fn()
            };

            cardRepository.updateById.mockReturnValue((data)=>AsyncEither.of(updated));
            
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse")

            const service = updateCardByIdService(cardRepository);
            const result = await service({id, ...data}).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(cardRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.color).toBe("BLUE");
            expect(result.value.value).toBe(-1);
            expect(result.value.type).toBe("DRAW_TWO");
        });

        test("does not update if data is incomplete ", async () => {
            const id = "123";
            const incompleteData = {
                value: 5,
                type: "NUMBER"
            };

            const cardRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdatedById = jest.fn();
            jest.spyOn(cardRepository, "updateById").mockReturnValue(curriedUpdatedById);

            const service = updateCardByIdService(cardRepository);
            const result = await service({id, ...incompleteData}).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdatedById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('color is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if no update if updated data is not provided", async () => {
            const id = { 
                id: "123"
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdatedById = jest.fn();
            jest.spyOn(cardRepository, "updateById").mockReturnValue(curriedUpdatedById);

            const service = updateCardByIdService(cardRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdatedById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('color is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
        test("does not update if id does not exist", async () => {
            const id = "invalidId";
            const data = {
                color: "BLUE",
                value: -1,
                type: "DRAW_TWO"
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            cardRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            const curriedValidateRequiredFields = jest.fn().mockImplementation(data => Either.right(data));
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateCardByIdService(cardRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateRequiredFields).toHaveBeenCalled();
            expect(cardRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if data contains id field", async () => {
            const id = "123";
            const data = {
                _id: "anotherId",
                color: "BLUE",
                value: -1,
                type: "DRAW_TWO"
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            cardRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateRequiredFields = jest.fn();
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = updateCardByIdService(cardRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateRequiredFields).not.toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is empty but data is valid", async () => {
            const id = "";
            const data = {
                color: "BLUE",
                value: -1,
                type: "DRAW_TWO"
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            cardRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = updateCardByIdService(cardRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(cardRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("partial update card tests", () => {
        test("partially updates card successfully", async () => {
            const id = "123";
            const partialData = {
                color: "GREEN"
            };
            const updated = {
                _id: id,
                color: "GREEN",
                value: 5,
                type: "NUMBER",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const cardRepository = {
                updateById: jest.fn()
            };

            cardRepository.updateById.mockReturnValue((data) => AsyncEither.of(updated));

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            jest.spyOn(schemaValidators, "toResponse");
            const service = partiallyUpdateCardByIdService(cardRepository);
            const result = await service({ id, ...partialData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(cardRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.color).toBe("GREEN");
            expect(result.value.value).toBe(5);
            expect(result.value.type).toBe("NUMBER");
        });

        
        test("does not update if any update data is provided", async () => {
            const id = { 
                id: "123",
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(cardRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = partiallyUpdateCardByIdService(cardRepository);
            const result = await service(id).run();
            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('No fields to update');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
        test("does not update if id is invalid", async () => {
            const id = {
                id: "invalidId",
                color: "RED"
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            cardRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateCardByIdService(cardRepository);
            const result = await service(id).run();
            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(cardRepository.updateById).toHaveBeenCalled();
            expect(curriedUpdateById).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
        test("does not update if id is empty", async () => {
            const id = { 
                id: "",
                color: "RED"
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            cardRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateCardByIdService(cardRepository);
            const result = await service(id).run();
            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(cardRepository.updateById).toHaveBeenCalled();
            expect(curriedUpdateById).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
        test("does not partially update if data contains id field", async () => {
            const id = "123";
            const data = {
                _id: "anotherId",
                color: "GREEN"
            };
            const cardRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            cardRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateAtLeastOneField = jest.fn();
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(curriedValidateAtLeastOneField);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = partiallyUpdateCardByIdService(cardRepository);
            const result = await service({ id, ...data}).run();


            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateAtLeastOneField).not.toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });


    describe("delete card tests", () => {
        test("deletes card successfully", async () => {
            const id = "123";
            const deletedCard = {
                _id: id,
                color: "RED",
                value: 5,
                type: "NUMBER",
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const cardRepository = {
                deleteById: jest.fn()
            };

            cardRepository.deleteById.mockReturnValue(AsyncEither.of(deletedCard));
            jest.spyOn(sharedValidators, "validateIdExistence");
            jest.spyOn(schemaValidators, "toResponse");
            const service = deleteCardByIdService(cardRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(cardRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not delete the card if id is empty", async () => {
            const cardRepository = {
                deleteById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = deleteCardByIdService(cardRepository);
            const result = await service({ id: "" }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(cardRepository.deleteById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not delete the card if id does not exist", async () => {
            const id = "invalidId";
            const cardRepository = {
                deleteById: jest.fn()
            };

            cardRepository.deleteById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = deleteCardByIdService(cardRepository);
            const result = await service({id: id}).run();
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(cardRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });
});
