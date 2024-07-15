const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers.js")

app.get("/api/topics", getTopics);

app.all("*", (req, res, next) => {
    res
    .status(404)
    .send({ msg: "invalid input" })
})

module.exports = app;