const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpointsFile = require("../endpoints.json");
const { checkIfCommentExists } = require('../models/comments.models');

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
    describe('GET /api/articles/:article_id/comments', () => {
        it('200: should return an array of comments for the specified article object', () => {
            return request(app)
            .get('/api/articles/3/comments')
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments.length).toEqual(2);

                comments.forEach((comment) => {
                    expect(comment.article_id).toBe(3);
                    expect(typeof comment.comment_id).toBe("number");
                    expect(typeof comment.votes).toBe("number");
                    expect(typeof comment.created_at).toBe("string");
                    expect(typeof comment.author).toBe("string");
                    expect(typeof comment.body).toBe("string");
                })

                expect(comments).toBeSortedBy("created_at", { descending: true });
            })
        })
        it("GET 404: should return an error message when provided with a valid article_id that is not found in the database", () => {
            return request(app)
            .get("/api/articles/99999999/comments")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("Not found");
              });
          });
        it('400: should return an error message when an article_id of an incorrect data type is provided', () => {
            return request(app)
            .get("/api/articles/not-a-number/comments")
            .expect(400)
            .then(({ body }) => {
                const { message } = body;
                expect(message).toBe('Invalid input');
          })
        }); 
    })
    describe('GET /api/users', () => {
        it('200: should return an object with username, name and avatar_url properties', () => {
            return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
              const { users } = body;   

              expect(users.length).toBe(4);    
              users.forEach((user) => {
                expect(typeof user.username).toBe("string");
                expect(typeof user.name).toBe("string");
                expect(typeof user.avatar_url).toBe("string");
              })
            })
        });
    })
})

describe('POST', () => {
    describe('POST /api/articles/:article_id/comments', () => {
        it('201: should return the newly posted comment', () => {
            const postObj = {
                username: "butter_bridge",
                body: "Chocolate is my favourite sweet"
            }
            return request(app)
            .post("/api/articles/2/comments")
            .send(postObj)
            .expect(201)
            .then(({ body: { comment } }) => {

              expect(comment).toEqual({
                   article_id: 2,
                   author: "butter_bridge",
                   body: "Chocolate is my favourite sweet",
                   comment_id: 19,
                   created_at: expect.any(String),
                   votes: 0,
                });
            })
        });
        it('400: should return an error message when required information is missing', () => {
            const newComment = {
                username: "butter_bridge"
            };
            return request(app)
            .post("/api/articles/2/comments")
            .send(newComment)
            .expect(400)
            .then(({body: { message }}) => {
                expect(message).toBe("Invalid input")
            })
        });
        it('404: should return an error message when provided with a valid article_id that is not found in the database', () => {
            const newComment = {
                username: 'butter_bridge',
                body: 'Hello, this test will throw a 404 error'
            }
            return request(app)
            .post('/api/articles/9999999/comments')
            .send(newComment)
            .expect(404)
            .then(({body: { message }}) => {
                expect(message).toBe('Article not found')
            })
        });
        it('400: should return an error message when provided with an article_id of an invalid data type', () => {
            const newComment = {
                username: 'butter_bridge',
                body: 'Hi, this test will throw a 400 error'
            }
            return request(app)
            .post('/api/articles/not-a-number/comments')
            .send(newComment)
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Invalid input')
            })
        });
        it('404: should return an error message when provided with an invalid username', () => {
            const newComment = {
                username: 'harry-potter',
                body: 'Wingardium leviosa! Oh, and this test will throw a 404 error'
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('Invalid username')
             })
        });    
    })
})

describe('PATCH', () => {
    describe('PATCH /api/articles/:article_id', () => {
        it('200: should return the incremented vote count', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 2})
            .expect(200)
            .then(({body: { article }}) => {
                expect(article).toEqual( {
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: expect.any(String),
                    votes: 102,
                    article_img_url:
                      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                  })
            })
        });
        it('200 should return the decreased vote count when provided with a negative number', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: -2})
            .expect(200)
            .then(({body: { article }}) => {
                expect(article).toEqual( {
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: expect.any(String),
                    votes: 98,
                    article_img_url:
                      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                  })
            })
        });
        it('400: should return an error message when inc_votes data type is not a number', () => {
            return request(app)
            .patch('/api/articles/2')
            .send({ inc_votes: 'NaN'})
            .expect(400)
            .then(({body: { message }}) => {
                expect(message).toBe('Invalid input')
            })
        });
        it('400: should return an error message when article_id data type is not a number', () => {
            return request(app)
            .patch('/api/articles/NaN')
            .send({ inc_votes: 5 })
            .expect(400)
            .then(({body: { message }}) => {
                expect(message).toBe('Invalid input')
            })
        });
        it('404: should return an error message when article_id is not in the database', () => {
            return request(app)
            .patch('/api/articles/999999')
            .send({ inc_votes: 8 })
            .expect(404)
            .then(({body: { message }}) => {
                expect(message).toBe('Not found')
            })
        });
    })
});

describe('DELETE', () => {
    describe('DELETE /api/comments/:comment_id', () => {
        it('204: should remove the comment selected by id from the database table', () => {
            return request(app)
            .delete('/api/comments/2')
            .expect(204)
            .then(() => {
                return checkIfCommentExists(2)
                .then((result) => {
                    expect(result).toBe(false);
                });
            });
        });
        it('404: should return an error message when comment_id does not exist in the database', () => {
            return request(app)
            .delete('/api/comments/999999')
            .expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('Not found')
            })
        })
        it('400: should return an error message when comment_id is not a number', () => {
            return request(app)
            .delete('/api/comments/NaN')
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Invalid input')
            })
        })
    })
})