import { createScoreService, getScoreByIdService, updateScoreByIdService, partiallyUpdateScoreByIdService, deleteScoreByIdService } from "../../../src/application/services/scoreService.js";
import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import * as schemaValidators from "../../../src/domain/validators/schemaValidators.js"
import * as sharedValidators from "../../../src/domain/validators/sharedValidators.js"
import * as helpers from "../../../src/domain/helpers/helpers.js";
import { Either } from "../../../src/shared/monads/Either.js";
import { Score } from "../../../src/domain/models/Score.js";

afterEach(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
  jest.resetModules();
});

describe("score  service tests", () => {
    describe("create score tests", ()=> {
        test("creates score with valid data", async() => {
            const score = {
                userId: "123",
                gameId: "456",
                value: 10
            };
            const savedScore ={
                _id: "789",
                userId: "123",
                gameId: "456",
                value: 10,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const scoreRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");

            scoreRepository.create.mockReturnValue(AsyncEither.of(savedScore))
            const service = createScoreService(scoreRepository);
            const result = await service(score).run();

            expect(scoreRepository.create).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value._id).toBe(savedScore._id);
            expect(result.value.userId).toBe(savedScore.userId);
            expect(result.value.gameId).toBe(savedScore.gameId);
            expect(result.value.value).toBe(savedScore.value);
        });

        test("Does not create a score if there is no data", async ()=> {
            const score = {};

            const scoreRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");

            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createScoreService(scoreRepository);
            const result = await service(score).run();

            expect(scoreRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('userId is required');
        });

        test("Does not create a score if required fields are incomplete", async ()=> {
            const score = {
                userId: "123",
                gameId: "456"
        
            };

            const scoreRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");

            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createScoreService(scoreRepository);
            const result = await service(score).run();

            expect(scoreRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('value is required');
        });

        test("Does not save additional fields ", async ()=> {
            const score = {
                userId: "123",
                gameId: "456",
                value: 10,
                extraField: "something"
            };

            const savedScore ={
                _id: "789",
                userId: "123",
                gameId: "456",
                value: 10,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const scoreRepository = {
                create: jest.fn()
            };

            scoreRepository.create.mockReturnValue(AsyncEither.of(savedScore));

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");      

            const service = createScoreService(scoreRepository);
            const result = await service(score).run();

            expect(scoreRepository.create).toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value).not.toHaveProperty('extraField');
        });
    });

    describe("get score tests", ()=> {
        test("returns score by id", async() => {
            const id = "789";
            const stored = {
                _id: id,
                userId: "123",
                gameId: "456",
                value: 10,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const scoreRepository = {
                getById: jest.fn()
            };

            scoreRepository.getById.mockReturnValue(AsyncEither.of(stored))

            jest.spyOn(sharedValidators, "validateIdExistence")
            jest.spyOn(schemaValidators, "toResponse");

            const service = getScoreByIdService(scoreRepository);
            const result = await service({id: id}).run();

            expect(scoreRepository.getById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(false);
            expect(result.value._id).toBe(id);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not return data if id is not provided", async () => {
            const scoreRepository = {
                getById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateIdExistence")
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getScoreByIdService(scoreRepository);
            const result = await service({ id: "" }).run();

            expect(scoreRepository.getById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('ID required');
        });

        test("does not return data for invalid Id", async () => {
            const scoreRepository = {
                getById: jest.fn()
            };

            scoreRepository.getById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence")
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getScoreByIdService(scoreRepository);
            const result = await service({ id: "invalidId" }).run();

            expect(scoreRepository.getById).toHaveBeenCalledWith("invalidId");
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('Not found');
        });
    });

    describe("update score tests", () => {
        test("updates score successfully", async () => {
            const id = "789";
            const data = {
                userId: "123",
                gameId: "456",
                value: 20
            };
            const updated = {
                _id: id,
                ...data,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const scoreRepository = {
                updateById: jest.fn()
            };

            scoreRepository.updateById.mockReturnValue((data)=>AsyncEither.of(updated));
            
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse")

            const service = updateScoreByIdService(scoreRepository);
            const result = await service({id, ...data}).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(scoreRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.userId).toBe("123");
            expect(result.value.gameId).toBe("456");
            expect(result.value.value).toBe(20);
        });

        test("does not update if data is incomplete ", async () => {
            const id = "789";
            const incompleteData = {
                userId: "123",
                gameId: "456"
            };

            const scoreRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(scoreRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = updateScoreByIdService(scoreRepository);
            const result = await service({id, ...incompleteData}).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('value is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if no update data is provided", async () => {
            const id = { 
                id: "789"
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(scoreRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = updateScoreByIdService(scoreRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('userId is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id does not exist", async () => {
            const id = "nonexistentId";
            const data = {
                userId: "123",
                gameId: "456",
                value: 20
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            scoreRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            const curriedValidateRequiredFields = jest.fn().mockImplementation(data => Either.right(data));
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateScoreByIdService(scoreRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateRequiredFields).toHaveBeenCalled();
            expect(scoreRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if data contains id field", async () => {
            const id = "789";
            const data = {
                _id: "anotherId",
                userId: "123",
                gameId: "456",
                value: 20
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            scoreRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateRequiredFields = jest.fn();
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateScoreByIdService(scoreRepository);
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
                userId: "123",
                gameId: "456",
                value: 20
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            scoreRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateScoreByIdService(scoreRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(scoreRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("partial update score tests", () => {
        test("partially updates score successfully", async () => {
            const id = "789";
            const partialData = {
                value: 30
            };
            const updated = {
                _id: id,
                userId: "123",
                gameId: "456",
                value: 30,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const scoreRepository = {
                updateById: jest.fn()
            };

            scoreRepository.updateById.mockReturnValue((data) => AsyncEither.of(updated));

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            jest.spyOn(schemaValidators, "toResponse");

            const service = partiallyUpdateScoreByIdService(scoreRepository);
            const result = await service({ id, ...partialData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(scoreRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.userId).toBe("123");
            expect(result.value.gameId).toBe("456");
            expect(result.value.value).toBe(30);
        });

        test("does not partially update if no update data is provided", async () => {
            const id = { 
                id: "789"
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(scoreRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = partiallyUpdateScoreByIdService(scoreRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('No fields to update');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not partially update if id is invalid", async () => {
            const id = {
                id: "invalidId",
                value: 30
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            scoreRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateScoreByIdService(scoreRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(scoreRepository.updateById).toHaveBeenCalledWith("invalidId");
            expect(curriedUpdateById).toHaveBeenCalledWith({ id: "invalidId", value: 30 });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not partially update if id is empty", async () => {
            const id = { 
                id: "",
                value: 30
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            scoreRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateScoreByIdService(scoreRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(scoreRepository.updateById).toHaveBeenCalledWith("");
            expect(curriedUpdateById).toHaveBeenCalledWith({ id: "", value: 30 });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not partially update if data contains id field", async () => {
            const id = "789";
            const data = {
                _id: "anotherId",
                value: 30
            };
            const scoreRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            scoreRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateAtLeastOneField = jest.fn();
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(curriedValidateAtLeastOneField);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateScoreByIdService(scoreRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateAtLeastOneField).not.toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("delete score tests", () => {
        test("deletes score successfully", async () => {
            const id = "789";
            const deletedScore = {
                _id: id,
                userId: "123",
                gameId: "456",
                value: 10,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const scoreRepository = {
                deleteById: jest.fn()
            };

            scoreRepository.deleteById.mockReturnValue(AsyncEither.of(deletedScore));
            jest.spyOn(sharedValidators, "validateIdExistence");
            jest.spyOn(schemaValidators, "toResponse");

            const service = deleteScoreByIdService(scoreRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(scoreRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not delete the score if id is empty", async () => {
            const scoreRepository = {
                deleteById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = deleteScoreByIdService(scoreRepository);
            const result = await service({ id: "" }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(scoreRepository.deleteById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not delete the score if id does not exist", async () => {
            const id = "invalidId";
            const scoreRepository = {
                deleteById: jest.fn()
            };

            scoreRepository.deleteById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = deleteScoreByIdService(scoreRepository);
            const result = await service({ id: id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(scoreRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });
});