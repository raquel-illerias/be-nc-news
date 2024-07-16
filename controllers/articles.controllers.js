const { fetchArticlesById } = require("../models/articles.models.js");

function getArticlesById(req, res, next) {
    const { article_id } = req.params;
    fetchArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((error) => {
      next(error);
    });
}

module.exports = { getArticlesById }