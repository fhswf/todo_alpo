import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todos';
const MONGO_DB = process.env.MONGO_DB || 'todos';

let db = null;
let collection = null;
let client = null;

function parseToObjectId(value) {
    try {
        // Check if it's a valid ObjectId and return it
        return new ObjectId(value)
    } catch (e) {
        // If parsing fails, return the original value
        return Number(value);
    }
}

export default class DB {
    /** Connect to MongoDB and open client */
    connect() {
        return MongoClient.connect(MONGO_URI)
            .then(function (_client) {
                client = _client;
                db = client.db(MONGO_DB);
                collection = db.collection('todos');
            })
    }

    /** Close client connection to MongoDB */
    close() {
        return client.close()
    }

    /** Get all todos 
     * @returns {Promise} - Promise with all todos
     */
    queryAll() {
        return collection.find().toArray();
    }

    /** Get todo by id 
     * @param {string} id - id of todo to query
     * @returns {Promise} - Promise with todo
     */
    queryById(id) {
        let _id = new ObjectId(id);
        return collection.findOne({ _id });
    }

    /** Update todo by id
     * @param {string} id - id of todo to update
     * @returns {Promise} - Promise with updated todo
     */
    update(id, todo) {
        let _id = parseToObjectId(id)
        if (typeof todo._id === 'string') {
            todo._id = _id;
        }
        
        return collection
            .replaceOne({_id: _id}, todo)
            .then(result => {
                if (result.modifiedCount === 1) {
                    return todo;
                } else {
                    // No document found to update
                    if (result.matchedCount === 0) {
                        // Return null to indicate not found
                        return null;
                    }
                    console.log('Error updating todo: %o, %s', result, id);
                    throw new Error('Error updating todo');
                }
            })
            .catch(err => {
                console.log('Error updating todo: %o, %s', err, id);
                throw err;
            });
    }

    /** Delete todo by id
     * @param {string} id - id of todo to delete
     * @returns {Promise} - Promise with deleted todo
     */
    delete(id) {
        let _id = parseToObjectId(id)
        return collection.findOneAndDelete({ _id: _id })
            .then(result => {
                if (result.ok) {
                    return result.value;
                }
                else {
                    console.log('Error deleting todo: %o, %s', result, id);
                    throw new Error('Error deleting todo');
                }
            })
    }

    /** Insert todo
     * @param {object} todo - todo to insert
     * @returns {Promise} - Promise with inserted todo
     */
    insert(todo) {
        return collection
            .insertOne(todo)
            .then(result => {
                if (result.acknowledged) {
                    todo._id = result.insertedId;
                    return todo;
                }
                else {
                    console.log('Error inserting todo: %o', result);
                    throw new Error('Error inserting todo');
                }
            });
    }

    /** Delete all todos (for testing purposes) */
    deleteAll() {
        return collection.deleteMany({});
    }
}
