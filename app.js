const express = require("express");
const app = express();
const endpoints = require("./endpoints.json")
const { getTopics } = require("./controllers/topics.controllers.js");
const { getArticlesById, getArticles } = require("./controllers/articles.controllers.js");
const { getCommentsByArticleId } = require("./controllers/comments.controllers.js");

app.get("/api", (req, res, next) => {
    res
    .status(200)
    .send({endpoints: endpoints})
})

app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticlesById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.all("*", (req, res, next) => {
    res
    .status(404)
    .send({ message: "Invalid input" })
});
app.use((err, req, res, next) => {
    if(err.code === '22P02') {
        res.status(400).send({ message:'Invalid input' })
    }
    next(err);
});
app.use((err, req, res, next) => {
    if(err.status && err.message) {
        res.status(err.status).send({ message: err.message })
    }
})

module.exports = app;