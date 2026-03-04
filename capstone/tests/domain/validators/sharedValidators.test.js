import * as sharedValidators from '../../../src/domain/validators/sharedValidators';

describe('sharedValidators tests', () => {
    describe('validateIdExistence tests', () => {
        test('returns success answer if id is present', () => {
            const id = '123';
            const result = sharedValidators.validateIdExistence(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toBe(id);
        });

        test('returns ID required if id is not present', () => {
            const falsyValues = [null, undefined, '', 0];
            falsyValues.forEach(id => {
                const result = sharedValidators.validateIdExistence(id);
                expect(result.isLeft()).toBe(true);
                expect(result.value).toBe('ID required');
            });
        });
    });

    describe('validateNoIdInData tests', () => {
        test('returns success answer if id is not in the sent data', () => {
            const data = {
                name: 'joaquin'
            };
            const result = sharedValidators.validateNoIdInData(data);
            expect(result.isRight()).toBe(true);
            expect(result.value).toBe(data);
        });

        test('returns error if id is in diven data', () => {
            const data = {
                _id: '123',
                name: 'test' };
            const result = sharedValidators.validateNoIdInData(data);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe('ID can not be modified');
        });
    });

    describe('rejectIfExists tests', () => {
        test('returns success if the data does not exists', () => {
            const falseValues = [null, undefined, false, 0, ''];
            falseValues.forEach(data => {
                const result = sharedValidators.rejectIfExists(data);
                expect(result.isRight()).toBe(true);
                expect(result.value).toBe(data);
            });
        });

        test('returns Already exists if data is present', () => {
            const validValues = [{}, { id: 1 }, 'string', 42, true];
            validValues.forEach(data => {
                const result = sharedValidators.rejectIfExists(data);
                expect(result.isLeft()).toBe(true);
                expect(result.value).toBe('Already Exists');
            });
        });
    });

    describe('requireExistence tests', () => {
        test('should return Right with data if data is truthy', () => {
            const validValues = [{}, {id: 1}, 'string', 42, true];
            validValues.forEach(data => {
                const result = sharedValidators.requireExistence(data);
                expect(result.isRight()).toBe(true);
                expect(result.value).toBe(data);
            });
        });

        test('returns error for invalid values', () => {
            const falseValues = [null, undefined, false, 0, ''];
            falseValues.forEach(data => {
                const result = sharedValidators.requireExistence(data);
                expect(result.isLeft()).toBe(true);
                expect(result.value).toBe('Not found');
            });
        });
    });

    describe('recover tests', () => {
        test('recovers original data', () => {
            const originalData = {
                key: 'value'
            };
            const recoveredFunctionality = sharedValidators.recover(originalData);
            const ignoreData = {
                anything: 'ignored'
            };
            const result = recoveredFunctionality(ignoreData);
            expect(result).toBe(originalData);
        });
    });
});