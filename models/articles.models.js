const db = require("../db/connection");

function fetchArticlesById(article_id) {
  return db
  .query(
    'SELECT * FROM articles WHERE article_id = $1',
    [article_id]
  )
  .then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "Not found" });
    }
    return rows[0];
  });
}

function fetchArticles(sortBy = "created_at", order = "desc") {
  const validSortFields = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];

  const valuesArr = [];
  let queryString = `
    SELECT 
      articles.title, 
      articles.article_id, 
      articles.topic, 
      articles.author, 
      articles.created_at, 
      articles.votes, 
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM 
      articles
    LEFT JOIN 
      comments
    ON 
      articles.article_id = comments.article_id
    GROUP BY articles.article_id
  `;

  if (!validSortFields.includes(sortBy)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  if (sortBy) {
    queryString += `ORDER BY ${sortBy} `;
  }

  if (order === "asc" || order === "desc") {
    queryString += `${order}`;
  } else {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  return db
  .query(queryString, valuesArr)
  .then(({ rows }) => {
    return rows;
  });
}


function updateArticleVotes(votes, articleId) {
  
  return fetchArticlesById(articleId)
    .then(() => {
      return db
      .query(
        'UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *',
        [votes, articleId]
      );
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Not found" });
      }
      return rows[0];
    })
}



module.exports = { fetchArticlesById, fetchArticles, updateArticleVotes }
