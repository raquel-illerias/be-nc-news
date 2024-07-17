const { fetchArticlesById, fetchArticles } = require("../models/articles.models.js");

function getArticlesById(req, res, next) {
    const { article_id } = req.params;
    fetchArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticles(req, res, next) {
  const {sort_by} = req.query;

  return fetchArticles(sort_by)
  .then((articles) => {
    res.status(200).send({ articles });
  })
  .catch((err) => {
    next(err);
  });
}

module.exports = { getArticlesById, getArticles }