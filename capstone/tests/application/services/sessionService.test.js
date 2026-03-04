import { createSessionService, getSessionByIdService, updateSessionByIdService, partiallyUpdateSessionByIdService, deleteSessionByIdService, getSessionByTokenService, partiallyUpdateSessionByTokenService } from "../../../src/application/services/sessionService.js";
import { AsyncEither } from "../../../src/shared/monads/AsyncEither.js";
import * as schemaValidators from "../../../src/domain/validators/schemaValidators.js"
import * as sharedValidators from "../../../src/domain/validators/sharedValidators.js"
import * as helpers from "../../../src/domain/helpers/helpers.js";
import { Either } from "../../../src/shared/monads/Either.js";
import { Session } from "../../../src/domain/models/Session.js";

afterEach(() => {
    jest.restoreAllMocks();
});

beforeEach(() => {
  jest.resetModules();
});

describe("session service unit tests", () => {
    describe("create session tests", ()=> {
        test("creates session with valid data", async() => {
            const session = {
                token: "validToken",
                userId: "123",
                revoked: false
            };
            const savedSession ={
                _id: "101",
                token: "validToken",
                userId: "123",
                revoked: false,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");

            sessionRepository.create.mockReturnValue(AsyncEither.of(savedSession))
            const service = createSessionService(sessionRepository);
            const result = await service(session).run();

            expect(sessionRepository.create).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value._id).toBe(savedSession._id);
            expect(result.value.token).toBe(savedSession.token);
            expect(result.value.userId).toBe(savedSession.userId);
            expect(result.value.revoked).toBe(savedSession.revoked);
        });

        test("Does not create a session if there is no data", async ()=> {
            const session = {};

            const sessionRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");

            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createSessionService(sessionRepository);
            const result = await service(session).run();

            expect(sessionRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('token is required');
        });

        test("Does not create a session if required fields are incomplete", async ()=> {
            const session = {
                token: "validToken"
            };

            const sessionRepository = {
                create: jest.fn()
            };

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");

            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = createSessionService(sessionRepository);
            const result = await service(session).run();

            expect(sessionRepository.create).not.toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('userId is required');
        });

        test("Does not save additional fields ", async ()=> {
            const session = {
                token: "validToken",
                userId: "123",
                revoked: false,
                extraField: "something"
            };

            const savedSession ={
                _id: "101",
                token: "validToken",
                userId: "123",
                revoked: false,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                create: jest.fn()
            };

            sessionRepository.create.mockReturnValue(AsyncEither.of(savedSession));

            jest.spyOn(helpers, "toDefault");
            jest.spyOn(schemaValidators, "validateRequiredFields")
            jest.spyOn(schemaValidators, "toResponse");      

            const service = createSessionService(sessionRepository);
            const result = await service(session).run();

            expect(sessionRepository.create).toHaveBeenCalled();
            expect(helpers.toDefault).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value).not.toHaveProperty('extraField');
        });
    });

    describe("get session by id tests", ()=> {
        test("returns session by id", async() => {
            const id = "101";
            const stored = {
                _id: id,
                token: "validToken",
                userId: "123",
                revoked: false,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                getById: jest.fn()
            };

            sessionRepository.getById.mockReturnValue(AsyncEither.of(stored))

            jest.spyOn(sharedValidators, "validateIdExistence")
            jest.spyOn(schemaValidators, "toResponse");

            const service = getSessionByIdService(sessionRepository);
            const result = await service({id: id}).run();

            expect(sessionRepository.getById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(false);
            expect(result.value._id).toBe(id);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not return data if id is not provided", async () => {
            const sessionRepository = {
                getById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateIdExistence")
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getSessionByIdService(sessionRepository);
            const result = await service({ id: "" }).run();

            expect(sessionRepository.getById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('ID required');
        });

        test("does not return data for invalid Id", async () => {
            const sessionRepository = {
                getById: jest.fn()
            };

            sessionRepository.getById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence")
            const curriedToResponse = jest.fn();            
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getSessionByIdService(sessionRepository);
            const result = await service({ id: "invalidId" }).run();

            expect(sessionRepository.getById).toHaveBeenCalledWith("invalidId");
            expect(result.isLeft()).toBe(true);
            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(curriedToResponse).not.toHaveBeenCalled();
            expect(result.value).toBe('Not found');
        });
    });

    describe("update session by id tests", () => {
        test("updates session successfully", async () => {
            const id = "101";
            const data = {
                token: "newToken",
                userId: "123",
                revoked: true
            };
            const updated = {
                _id: id,
                ...data,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                updateById: jest.fn()
            };

            sessionRepository.updateById.mockReturnValue((data)=>AsyncEither.of(updated));
            
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            jest.spyOn(schemaValidators, "toResponse")

            const service = updateSessionByIdService(sessionRepository);
            const result = await service({id, ...data}).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(sessionRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.token).toBe("newToken");
            expect(result.value.revoked).toBe(true);
        });

        test("does not update if data is incomplete ", async () => {
            const id = "101";
            const incompleteData = {
                token: "newToken"

            };

            const sessionRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(sessionRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = updateSessionByIdService(sessionRepository);
            const result = await service({id, ...incompleteData}).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('userId is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if no update data is provided", async () => {
            const id = { 
                id: "101"
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(sessionRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = updateSessionByIdService(sessionRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('token is required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id does not exist", async () => {
            const id = "nonexistentId";
            const data = {
                token: "newToken",
                userId: "123",
                revoked: true
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            sessionRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            const curriedValidateRequiredFields = jest.fn().mockImplementation(data => Either.right(data));
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateSessionByIdService(sessionRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateRequiredFields).toHaveBeenCalled();
            expect(sessionRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if data contains _id field", async () => {
            const id = "101";
            const data = {
                _id: "anotherId",
                token: "newToken",
                userId: "123",
                revoked: true
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            sessionRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateRequiredFields = jest.fn();
            jest.spyOn(schemaValidators, "validateRequiredFields").mockReturnValue(curriedValidateRequiredFields);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateSessionByIdService(sessionRepository);
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
                token: "newToken",
                userId: "123",
                revoked: true
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            sessionRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateRequiredFields");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = updateSessionByIdService(sessionRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateRequiredFields).toHaveBeenCalled();
            expect(sessionRepository.updateById).toHaveBeenCalledWith(id);
            expect(curriedUpdateById).toHaveBeenCalledWith({ id, ...data });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("partial update session by id tests", () => {
        test("partially updates session successfully", async () => {
            const id = "101";
            const partialData = {
                revoked: true
            };
            const updated = {
                _id: id,
                token: "validToken",
                userId: "123",
                revoked: true,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                updateById: jest.fn()
            };

            sessionRepository.updateById.mockReturnValue((data) => AsyncEither.of(updated));

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            jest.spyOn(schemaValidators, "toResponse");

            const service = partiallyUpdateSessionByIdService(sessionRepository);
            const result = await service({ id, ...partialData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(sessionRepository.updateById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
            expect(result.value.revoked).toBe(true);
        });

        test("does not update if no update data is provided", async () => {
            const id = { 
                id: "101"
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateById = jest.fn();
            jest.spyOn(sessionRepository, "updateById").mockReturnValue(curriedUpdateById);

            const service = partiallyUpdateSessionByIdService(sessionRepository);
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
                revoked: true
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            sessionRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateSessionByIdService(sessionRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(sessionRepository.updateById).toHaveBeenCalledWith("invalidId");
            expect(curriedUpdateById).toHaveBeenCalledWith({ id: "invalidId", revoked: true });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update if id is empty", async () => {
            const id = { 
                id: "",
                revoked: true
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            sessionRepository.updateById.mockReturnValue(curriedUpdateById);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateSessionByIdService(sessionRepository);
            const result = await service(id).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(sessionRepository.updateById).toHaveBeenCalledWith("");
            expect(curriedUpdateById).toHaveBeenCalledWith({ id: "", revoked: true });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not partially update if data contains _id field", async () => {
            const id = "101";
            const data = {
                _id: "anotherId",
                revoked: true
            };
            const sessionRepository = {
                updateById: jest.fn()
            };

            const curriedUpdateById = jest.fn();
            sessionRepository.updateById.mockReturnValue(curriedUpdateById);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateAtLeastOneField = jest.fn();
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(curriedValidateAtLeastOneField);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = partiallyUpdateSessionByIdService(sessionRepository);
            const result = await service({ id, ...data }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateAtLeastOneField).not.toHaveBeenCalled();
            expect(curriedUpdateById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("delete session by id tests", () => {
        test("deletes session successfully", async () => {
            const id = "101";
            const deletedSession = {
                _id: id,
                token: "validToken",
                userId: "123",
                revoked: false,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                deleteById: jest.fn()
            };

            sessionRepository.deleteById.mockReturnValue(AsyncEither.of(deletedSession));
            jest.spyOn(sharedValidators, "validateIdExistence");
            jest.spyOn(schemaValidators, "toResponse");

            const service = deleteSessionByIdService(sessionRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(sessionRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value._id).toBe(id);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not delete the session if id is empty", async () => {
            const sessionRepository = {
                deleteById: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = deleteSessionByIdService(sessionRepository);
            const result = await service({ id: "" }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(sessionRepository.deleteById).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID required');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not delete the session if id does not exist", async () => {
            const id = "invalidId";
            const sessionRepository = {
                deleteById: jest.fn()
            };

            sessionRepository.deleteById.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            jest.spyOn(sharedValidators, "validateIdExistence");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = deleteSessionByIdService(sessionRepository);
            const result = await service({ id }).run();

            expect(sharedValidators.validateIdExistence).toHaveBeenCalled();
            expect(sessionRepository.deleteById).toHaveBeenCalledWith(id);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("get session by token tests", () => {
        test("returns session by token", async() => {
            const token = "validToken";
            const stored = {
                _id: "101",
                token: token,
                userId: "123",
                revoked: false,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                getByToken: jest.fn()
            };

            sessionRepository.getByToken.mockReturnValue(AsyncEither.of(stored))
            jest.spyOn(schemaValidators, "toResponse");

            const service = getSessionByTokenService(sessionRepository);
            const result = await service({ token }).run();

            expect(sessionRepository.getByToken).toHaveBeenCalledWith(token);
            expect(result.isRight()).toBe(true);
            expect(result.value.token).toBe(token);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not return data if token is empty", async () => {
            const sessionRepository = {
                getByToken: jest.fn()
            };
            sessionRepository.getByToken.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));

            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);

            const service = getSessionByTokenService(sessionRepository);
            const result = await service({ token: "" }).run();

            expect(sessionRepository.getByToken).toHaveBeenCalledWith("");
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not return data if token does not exist", async () => {
            const sessionRepository = {
                getByToken: jest.fn()
            };
            sessionRepository.getByToken.mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = getSessionByTokenService(sessionRepository);
            const result = await service({ token: "nonexistent" }).run();

            expect(sessionRepository.getByToken).toHaveBeenCalledWith("nonexistent");
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });

    describe("partial update session by token tests", () => {
        test("partially updates session by token successfully", async () => {
            const token = "validToken";
            const partialData = {
                revoked: true
            };
            const updated = {
                _id: "101",
                token: token,
                userId: "123",
                revoked: true,
                createdAt: "2026-02-13T14:11:22.757+00:00"
            };

            const sessionRepository = {
                updateByToken: jest.fn()
            };

            const curriedUpdateByToken = jest.fn().mockReturnValue(AsyncEither.of(updated));
            sessionRepository.updateByToken.mockReturnValue(curriedUpdateByToken);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            jest.spyOn(schemaValidators, "toResponse");
            const service = partiallyUpdateSessionByTokenService(sessionRepository);
            const result = await service({ token, ...partialData }).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(sessionRepository.updateByToken).toHaveBeenCalledWith(token);
            expect(curriedUpdateByToken).toHaveBeenCalledWith({ token, revoked: true });
            expect(result.isRight()).toBe(true);
            expect(result.value.token).toBe(token);
            expect(result.value.revoked).toBe(true);
            expect(schemaValidators.toResponse).toHaveBeenCalled();
        });

        test("does not update by token if no update data is provided", async () => {
            const token = { 
                token: "validToken"
            };
            const sessionRepository = {
                updateByToken: jest.fn()
            };

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const curriedUpdateByToken = jest.fn();
            jest.spyOn(sessionRepository, "updateByToken").mockReturnValue(curriedUpdateByToken);

            const service = partiallyUpdateSessionByTokenService(sessionRepository);
            const result = await service(token).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(curriedUpdateByToken).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('No fields to update');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update by token if token is invalid", async () => {
            const token = {
                token: "invalidToken",
                revoked: true
            };
            const sessionRepository = {
                updateByToken: jest.fn()
            };

            const curriedUpdateByToken = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            sessionRepository.updateByToken.mockReturnValue(curriedUpdateByToken);

            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = partiallyUpdateSessionByTokenService(sessionRepository);
            const result = await service(token).run();
            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(sessionRepository.updateByToken).toHaveBeenCalledWith("invalidToken");
            expect(curriedUpdateByToken).toHaveBeenCalledWith({ token: "invalidToken", revoked: true });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not update by token if token is empty", async () => {
            const token = {
                token: "",
                revoked: true
            };
            const sessionRepository = {
                updateByToken: jest.fn()
            };

            const curriedUpdateByToken = jest.fn().mockReturnValue(AsyncEither.fromEither(Either.left('Not found')));
            sessionRepository.updateByToken.mockReturnValue(curriedUpdateByToken);
            jest.spyOn(sharedValidators, "validateNoIdInData");
            jest.spyOn(schemaValidators, "validateAtLeastOneField");
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = partiallyUpdateSessionByTokenService(sessionRepository);
            const result = await service(token).run();

            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(schemaValidators.validateAtLeastOneField).toHaveBeenCalled();
            expect(sessionRepository.updateByToken).toHaveBeenCalledWith("");
            expect(curriedUpdateByToken).toHaveBeenCalledWith({ token: "", revoked: true });
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('Not found');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });

        test("does not partially update by token if data contains id field", async () => {
            const token = "validToken";
            const data = {
                _id: "anotherId",
                revoked: true
            };
            const sessionRepository = {
                updateByToken: jest.fn()
            };

            const curriedUpdateByToken = jest.fn();
            sessionRepository.updateByToken.mockReturnValue(curriedUpdateByToken);
            jest.spyOn(sharedValidators, "validateNoIdInData").mockReturnValue(Either.left('ID can not be modified'));
            const curriedValidateAtLeastOneField = jest.fn();
            jest.spyOn(schemaValidators, "validateAtLeastOneField").mockReturnValue(curriedValidateAtLeastOneField);
            const curriedToResponse = jest.fn();
            jest.spyOn(schemaValidators, "toResponse").mockReturnValue(curriedToResponse);
            const service = partiallyUpdateSessionByTokenService(sessionRepository);
            const result = await service({ token, ...data }).run();
            expect(sharedValidators.validateNoIdInData).toHaveBeenCalled();
            expect(curriedValidateAtLeastOneField).not.toHaveBeenCalled();
            expect(curriedUpdateByToken).not.toHaveBeenCalled();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
            expect(curriedToResponse).not.toHaveBeenCalled();
        });
    });
});