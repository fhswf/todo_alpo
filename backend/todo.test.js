import request from 'supertest';
import { app, server, db } from './index';
import getKeycloakToken from './utils';

const serv = await server
let token = '123'; // Speichert den abgerufenen mock JWT-Token

describe('GET /todos (unautorisiert)', () => {
    it('sollte einen 401-Fehler zurückgeben, wenn kein Token bereitgestellt wird', async () => {
        const response = await request(app).get('/todos'); // Kein Authorization-Header

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });
});

describe('GET /todos', () => {
    it('sollte alle Todos abrufen', async () => {
        const response = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`)

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});

describe('POST /todos', () => {
    it('sollte ein neues Todo erstellen', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newTodo.title);
        expect(response.body.due).toBe(newTodo.due);
    });

    it('sollte einen 400-Fehler zurückgeben, wenn das Todo unvollständig ist', async () => {
        const newTodo = {
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0,
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it('sollte einen 400-Fehler zurückgeben, wenn das Todo nicht valide ist', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0,
            "invalid": "invalid"
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });
});

describe('GET /todos/:id', () => {
    it('sollte ein Todo abrufen', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);
      
        const id = response._body._id;

        const getResponse = await request(app)
            .get(`/todos/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.title).toBe(newTodo.title);
        expect(getResponse.body.due).toBe(newTodo.due);
    });

    it('sollte einen 404-Fehler zurückgeben, wenn das Todo nicht gefunden wurde', async () => {
        const id = '123456789012345678901234';

        const getResponse = await request(app)
            .get(`/todos/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(404);
        expect(getResponse.body.error).toMatch(/Todo with id .+ not found/);
    });
});

describe('PUT /todos/:id', () => {
    it('sollte ein Todo aktualisieren', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        const updatedTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 1,
            "_id": response.body._id
        };

        const updateResponse = await request(app)
            .put(`/todos/${response.body._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedTodo);

        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body.status).toBe(updatedTodo.status);
    });
});

describe('DELETE /todos/:id', () => {
    it('sollte ein Todo löschen', async () => {
        const newTodo = {
            "title": "Übung 4 machen",
            "due": "2022-11-12T00:00:00.000Z",
            "status": 0
        };

        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send(newTodo);

        const deleteResponse = await request(app)
            .delete(`/todos/${response.body._id}`)
            .set('Authorization', `Bearer ${token}`);


        expect(deleteResponse.statusCode).toBe(204);

        const getResponse = await request(app)
            .get(`/todos/${response.body._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(404);
    });
});

let createdTodoId;
let validToken = '123';   // Authorized token
let invalidToken = 'wrongToken123'; // Invalid token for testing unauthorized access

describe('Authentication Edge Cases', () => {
    it('should return 401 for POST /todos with an invalid token', async () => {
        const newTodo = {
            "title": "Test invalid auth",
            "due": "2024-12-31T00:00:00.000Z",
            "status": 0
        };
        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${invalidToken}`)
            .send(newTodo);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 for DELETE /todos/:id with no token', async () => {
        const response = await request(app)
            .delete('/todos/123456789012345678901234'); // arbitrary ID
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });
});

describe('POST /todos Additional Cases', () => {
    it('should return 400 if POST /todos is called with an empty body', async () => {
        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${validToken}`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toMatch(/Fehlende Felder/);
    });

    it('should create a valid todo for later PUT/DELETE tests', async () => {
        const newTodo = {
            "title": "Todo for PUT/DELETE tests",
            "due": "2025-01-01T00:00:00.000Z",
            "status": 0
        };
        const response = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${validToken}`)
            .send(newTodo);

        expect(response.statusCode).toBe(201);
        expect(response.body._id).toBeDefined();
        createdTodoId = response.body._id;
    });
});

describe('PUT /todos/:id Additional Cases', () => {
    it('should return 400 if the URL :id does not match the body _id', async () => {
        const mismatchedIdTodo = {
            "_id": "123456789012345678901234", // Mismatching ID
            "title": "Mismatched ID",
            "due": "2025-01-01T00:00:00.000Z",
            "status": 1
        };
        const response = await request(app)
            .put(`/todos/${createdTodoId}`)
            .set('Authorization', `Bearer ${validToken}`)
            .send(mismatchedIdTodo);

        // Expecting 400 because the ID in body does not match the path
        expect(response.statusCode).toBe(400);
    });

    it('should return 404 if trying to update a non-existent Todo', async () => {
        const nonExistentId = '5f9a3b2a9d9b4b2d9c9b3b2a'; // well-formed but non-existent
        const updateData = {
            "_id": nonExistentId,
            "title": "Non-existent Todo",
            "due": "2025-01-01T00:00:00.000Z",
            "status": 1
        };

        const response = await request(app)
            .put(`/todos/${nonExistentId}`)
            .set('Authorization', `Bearer ${validToken}`)
            .send(updateData);

        expect(response.statusCode).toBe(404);
    });
});

describe('DELETE /todos/:id Additional Cases', () => {
    it('should return 404 if trying to delete a non-existent Todo', async () => {
        const nonExistentId = '5f9a3b2a9d9b4b2d9c9b3b2b';
        const response = await request(app)
            .delete(`/todos/${nonExistentId}`)
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.statusCode).toBe(404);
    });

    it('should return 500 if the ID format is invalid for DELETE', async () => {
        // Non-hex, invalid ObjectID format might cause DB error
        const invalidId = 'invalid_id_format_@@@';
        const response = await request(app)
            .delete(`/todos/${invalidId}`)
            .set('Authorization', `Bearer ${validToken}`);

        expect([500, 404]).toContain(response.statusCode);
    });
});

describe('Empty Database Scenario', () => {
    it('should return an empty array if no Todos exist (after cleaning)', async () => {
        await db.deleteAll();
        const response = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
});

afterAll(async () => {
    serv.close()
    db.close()
})
