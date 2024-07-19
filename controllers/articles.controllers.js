const { fetchArticlesById, fetchArticles, updateArticleVotes } = require("../models/articles.models.js");

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
  const { order, sort_by } = req.query;

  return fetchArticles(sort_by, order)
  .then((articles) => {
    res.status(200).send({ articles });
  })
  .catch((err) => {
    next(err);
  });
}


function patchArticleVotes(req, res, next) {
  const { inc_votes } = req.body;
  const { article_id } = req.params;

  updateArticleVotes(inc_votes, article_id)
  .then((updatedArticle) => {
    res.status(200).send({ article: updatedArticle });
  })
  .catch((err) => {
    next(err);
  });
}

module.exports = { getArticlesById, getArticles, patchArticleVotes }