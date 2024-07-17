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
    it('ALL METHODS 404: return an error message for an endpoint not found', () => {
        return request(app)
        .get("/api/invalid-endpoint")
        .expect(404)
        .then(({ body }) => {
            const {message} = body;
            expect(message).toBe("Invalid input");
        })
    })
})

describe('GET', () => {
    describe('GET /api', () => {
        it('200: should return a JSON object detailing all available endpoints', () => {
            return request(app)
                .get('/api')
                .expect(200)
                .then(({ body }) => {
                    expect(body.endpoints).toEqual(endpointsFile)
                })
        })
    })
    describe('GET /api/topics', () => {
        it('200: should return an object with slug and description properties', () => {
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
    describe('GET /api/articles/:article_id', () => {
        it('200: should return the specified article object', () => {
            return request(app)
            .get("/api/articles/6")
            .expect(200)
            .then(({ body }) => {
                
              expect(body).toEqual({article: {
                article_id: 6,
                title: "A",
                topic: "mitch",
                author: "icellusedkars",
                body: "Delicious tin of cat food",
                created_at: "2020-10-18T01:00:00.000Z",
                votes: 0,
                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
              }})
            })
        });  
        it('400: should return an error message when an article_id of an incorrect data type is provided', () => {
            return request(app)
            .get("/api/articles/not-a-number")
            .expect(400)
            .then(({ body }) => {
                const { message } = body;
                expect(message).toBe('Invalid input');
            })
        });
        it('404: should return an error message when provided with a valid article_id that is not found in the database', () => {
            return request(app)
            .get("/api/articles/99999999")
            .expect(404)
            .then(({ body }) => {
                const { message } = body;
                expect(message).toBe('Not found');
            })
        })
    })
    describe('GET /api/articles', () => {
        it('200: should return an array with all articles objects sorted by date in descending order', () => {
            return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body

                expect(articles.length).toBe(13);

                articles.forEach((article) => {
                expect(typeof article.author).toBe("string");
                expect(typeof article.title).toBe("string");
                expect(typeof article.article_id).toBe("number");
                expect(typeof article.topic).toBe("string");
                expect(typeof article.created_at).toBe("string");
                expect(typeof article.votes).toBe("number");
                expect(typeof article.article_img_url).toBe("string");
                expect(typeof article.comment_count).toBe("string");
                })

                expect(articles).toBeSortedBy("created_at", { descending: true });
            });
        })
    })
})