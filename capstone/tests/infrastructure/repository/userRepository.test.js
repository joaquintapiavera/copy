import MongoUser from "../../../src/infrastructure/mongo_schemas/user";
import UserRepository from "../../../src/infrastructure/repository/userRepository";


jest.mock("../../../src/infrastructure/mongo_schemas/user.js", () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn()
}));

describe("UserRepository", () => {
    let userRepository;
    const user = {
        _id: "123",
        username: "testuser",
        email: "joaquin@gmail.com",
        password: "hashed",
        isReady: false,
        saidUno: false,
        hand: [],
        score: 0,
        createdAt: new Date()
    };
    const userObject = { toObject: () => user };
    beforeEach(() => {
        userRepository = new UserRepository();
        jest.clearAllMocks();
    });

    describe("create tests", () => {
        test("should return Right with created user on success", async () => {
            MongoUser.create.mockResolvedValue(userObject);

            const result = await userRepository.create(user).run();

            expect(MongoUser.create).toHaveBeenCalledWith(user);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(user);
        });

        test("should return Left when creation returns null", async () => {
            MongoUser.create.mockResolvedValue(null);

            const result = await userRepository.create(user).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not created");
        });
    });

    describe("getById tests", () => {
        const id = "123";

        test("should return Right with user on success", async () => {
            MongoUser.findById.mockResolvedValue(userObject);

            const result = await userRepository.getById(id).run();

            expect(MongoUser.findById).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(user);
        });

        test("should return Left when user not found", async () => {
            MongoUser.findById.mockResolvedValue(null);

            const result = await userRepository.getById(id).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("updateById tests", () => {
        const id = "123";
        const updateData = {username: "updateduser"};

        test("should return Right with updated user on success", async () => {
            MongoUser.findByIdAndUpdate.mockResolvedValue(userObject);
            const updateFunc = userRepository.updateById(id);
            const result = await updateFunc(updateData).run();

            expect(MongoUser.findByIdAndUpdate).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(user);
        });

        test("should return Left when user not found for update", async () => {
            MongoUser.findByIdAndUpdate.mockResolvedValue(null);
            const updateFunc = userRepository.updateById(id);
            const result = await updateFunc(updateData).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("deleteById tests", () => {
        const id = "123";

        test("should return Right with deleted user on success", async () => {
            MongoUser.findByIdAndDelete.mockResolvedValue(userObject);
            const result = await userRepository.deleteById(id).run();
            expect(MongoUser.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(user);
        });

        test("should return Left when user not found for delete", async () => {
            MongoUser.findByIdAndDelete.mockResolvedValue(null);
            const result = await userRepository.deleteById(id).run();
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("getByUsername tests", () => {
        const username = "testuser";

        test("should return Right with user on success", async () => {
            MongoUser.findOne.mockResolvedValue(userObject);
            const result = await userRepository.getByUsername(username).run();

            expect(MongoUser.findOne).toHaveBeenCalledWith({ username });
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(user);
        });

        test("should return Left when user not found by username", async () => {
            MongoUser.findOne.mockResolvedValue(null);
            const result = await userRepository.getByUsername(username).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });

    });

    describe("getUsersById tests", () => {
        const ids = ["123", "456"];
        test("returns found users by ids", async () => {
            const users = [
                {...user, _id: "123" },
                {...user, _id: "456", username: "other" }
            ];
            const objects = users.map(u => ({toObject: ()=> u }));
            MongoUser.findById.mockResolvedValueOnce(objects[0]).mockResolvedValueOnce(objects[1]);
            const result = await userRepository.getByIds(ids).run();

            expect(MongoUser.findById).toHaveBeenCalledTimes(2);
            expect(MongoUser.findById).toHaveBeenCalledWith("123");
            expect(MongoUser.findById).toHaveBeenCalledWith("456");
            expect(result.isRight()).toBe(true);
        });
    });
    describe("getByIds tests", () => {
        const ids = ["123", "456"];

        test("returns Right with array of users when all found", async () => {
            const users = [
                { ...user, _id: "123" },
                { ...user, _id: "456", username: "other" }
            ];
            const objects = users.map(u => ({ toObject: () => u }));
            MongoUser.findById.mockResolvedValueOnce(objects[0]).mockResolvedValueOnce(objects[1]);

            const result = await userRepository.getByIds(ids).run();

            expect(MongoUser.findById).toHaveBeenCalledTimes(2);
            expect(MongoUser.findById).toHaveBeenCalledWith("123");
            expect(MongoUser.findById).toHaveBeenCalledWith("456");
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(users);
        });

        test("returns Left if any user not found", async () => {
            MongoUser.findById.mockResolvedValueOnce(userObject).mockResolvedValueOnce(null);

            const result = await userRepository.getByIds(ids).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("updateMultiple tests", () => {
        const ids = ["123", "456"];
        const datas = [{ username: "updated1" }, { username: "updated2" }];

        test("returns Right with array of updated users on success", async () => {
            const updatedUsers = [
                { ...user, _id: "123", username: "updated1" },
                { ...user, _id: "456", username: "updated2" }
            ];
            const objects = updatedUsers.map(u => ({ toObject: () => u }));
            MongoUser.findByIdAndUpdate
                .mockResolvedValueOnce(objects[0])
                .mockResolvedValueOnce(objects[1]);

            const updateFunc = userRepository.updateMultiple(ids);
            const result = await updateFunc(datas).run();

            expect(MongoUser.findByIdAndUpdate).toHaveBeenCalledTimes(2);
            expect(MongoUser.findByIdAndUpdate).toHaveBeenCalledWith(
                "123", { $set: datas[0] }, { new: true }
            );
            expect(MongoUser.findByIdAndUpdate).toHaveBeenCalledWith(
                "456", { $set: datas[1] }, { new: true }
            );
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(updatedUsers);
        });

        test("returns Right with null entries if some updates fail", async () => {
            MongoUser.findByIdAndUpdate
                .mockResolvedValueOnce(userObject)
                .mockResolvedValueOnce(null);

            const updateFunc = userRepository.updateMultiple(ids);
            const result = await updateFunc(datas).run();

            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual([user, null]);
        });
    });

    describe("getUsersByUsername tests", () => {
        const usernames = ["testuser", "other"];

        test("returns Right with array of users when all found", async () => {
            const users = [
                { ...user, username: "testuser" },
                { ...user, username: "other", _id: "456" }
            ];
            const objects = users.map(u => ({ toObject: () => u }));
            MongoUser.findOne
                .mockResolvedValueOnce(objects[0])
                .mockResolvedValueOnce(objects[1]);

            const result = await userRepository.getUsersByUsername(usernames).run();

            expect(MongoUser.findOne).toHaveBeenCalledTimes(2);
            expect(MongoUser.findOne).toHaveBeenCalledWith({ username: "testuser" });
            expect(MongoUser.findOne).toHaveBeenCalledWith({ username: "other" });
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(users);
        });

        test("returns Left if any user not found", async () => {
            MongoUser.findOne
                .mockResolvedValueOnce(userObject)
                .mockResolvedValueOnce(null);

            const result = await userRepository.getUsersByUsername(usernames).run();

            expect(result.isLeft()).toBe(true);
            expect(result.value).toBe("Not found");
        });
    });

    describe("doesNotExistByUsername tests", () => {
        const username = "testuser";

        test("returns Right with user object if exists", async () => {
            MongoUser.findOne.mockResolvedValue(userObject);
            const result = await userRepository.doesNotExistByUsername(username).run();

            expect(MongoUser.findOne).toHaveBeenCalledWith({ username });
            expect(result.isRight()).toBe(true);
            expect(result.value).toEqual(user);
        });

        test("returns Right with null if does not exist", async () => {
            MongoUser.findOne.mockResolvedValue(null);
            const result = await userRepository.doesNotExistByUsername(username).run();

            expect(result.isRight()).toBe(true);
            expect(result.value).toBeNull();
        });
    });
});