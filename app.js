const express = require("express");
const app = express();
const endpoints = require("./endpoints.json")
const { getTopics } = require("./controllers/topics.controllers.js")

app.use(express.json());

app.get("/api", (req, res, next) => {
    res
    .status(200)
    .send({endpoints: endpoints})
})

app.get("/api/topics", getTopics);

app.all("*", (req, res, next) => {
    res
    .status(404)
    .send({ msg: "invalid input" })
})

module.exports = app;