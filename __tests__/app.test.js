const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpointsFile = require("../endpoints.json");

beforeEach(() => {
    return seed(data)
})

afterAll(() => {
    return db.end();
})

describe('Incorrect URLs', () => {
    it('ALL METHODS 404: responds with an error for an endpoint not found', () => {
        return request(app)
        .get("/api/invalid-endpoint")
        .expect(404)
        .then(({ body }) => {
            const {msg} = body;
            expect(msg).toBe("invalid input");
        })
    })
})

describe('GET', () => {
    describe('/api', () => {
        it('200: should respond with a JSON object detailing all available endpoints', () => {
            return request(app)
                .get('/api')
                .expect(200)
                .then(({ body }) => {
                    expect(body.endpoints).toEqual(endpointsFile)
                })
        })
    })
    describe('/api/topics', () => {
        it('200: should respond with an object with slug and description properties', () => {
            return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
              const { topics } = body;    
              expect(topics.length).toBe(3);    
              topics.forEach((topic) => {
                expect(typeof topic.slug).toBe("string");
                expect(typeof topic.description).toBe("string");
              })
            })
        })
    })   
})