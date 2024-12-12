import { jest } from '@jest/globals';

jest.unstable_mockModule('mongodb', () => {
    const findMock = jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) });
    const collectionMock = { 
        find: findMock,
        insertOne: jest.fn().mockResolvedValue({ acknowledged: true, insertedId: 'mockId' }),
        findOne: jest.fn().mockResolvedValue(null),
        replaceOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
        findOneAndDelete: jest.fn().mockResolvedValue({ ok: 1, value: { title: "test" } })
    };
    const dbMock = { collection: jest.fn().mockReturnValue(collectionMock) };
    const clientMock = { db: jest.fn().mockReturnValue(dbMock), close: jest.fn() };
    
    return {
        MongoClient: {
            connect: jest.fn().mockResolvedValue(clientMock)
        },
        ObjectId: jest.fn().mockImplementation(id => ({ id }))
    };
});

const { default: DB } = await import('./db.js');

describe('DB Class', () => {
    let db;
    beforeAll(async () => {
        db = new DB();
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test('queryAll returns an array', async () => {
        const result = await db.queryAll();
        expect(Array.isArray(result)).toBe(true);
    });

    test('insert inserts a todo and returns it', async () => {
        const todo = { title: "Test" };
        const result = await db.insert(todo);
        expect(result._id).toBe('mockId');
    });

    test('queryById returns null if not found', async () => {
        const result = await db.queryById('notfoundid');
        expect(result).toBeNull();
    });

    test('update returns the updated todo', async () => {
        const todo = { _id: "someid", title: "Update Test" };
        const result = await db.update('someid', todo);
        expect(result).toEqual(todo);
    });

    test('delete returns the deleted todo', async () => {
        const result = await db.delete('deleteid');
        expect(result).toEqual({ title: "test" });
    });
});
