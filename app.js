const express = require("express");
const app = express();
const endpoints = require("./endpoints.json")
const { getTopics } = require("./controllers/topics.controllers.js");
const { getArticlesById, getArticles, patchArticleVotes } = require("./controllers/articles.controllers.js");
const { getCommentsByArticleId, postCommentByArticleId } = require("./controllers/comments.controllers.js");

app.use(express.json());

app.get("/api", (req, res, next) => {
    res
    .status(200)
    .send({endpoints: endpoints})
})

app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticlesById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchArticleVotes);

app.all("*", (req, res, next) => {
    res
    .status(404)
    .send({ message: "Invalid input" })
});
app.use((err, req, res, next) => {
    if(err.code === '22P02' || err.code === '23502') {
        res.status(400).send({ message:'Invalid input' })
    } else if(err.code === '23503') {
        res.status(404).send({ message: 'Invalid username'})
    }
    next(err);
});
app.use((err, req, res, next) => {
    if(err.status && err.message) {
        res.status(err.status).send({ message: err.message })
    }
    next(err)
})

module.exports = app;