const db = require("../db/connection");
const { checkIfTopicExists } = require("./utils.models");

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

function fetchArticles(sortBy = "created_at", order = "desc", topic) {
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

  if (!validSortFields.includes(sortBy)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  if (order !== "asc" && order !== "desc") {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

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
  `;

  if (topic) {
    return checkIfTopicExists(topic).then((result) => {
      if (!result) {
        return Promise.reject({ status: 400, message: "Bad request" });
      } else {
        queryString += `WHERE topic = $1 `;
        valuesArr.push(topic);
        queryString += `GROUP BY articles.article_id `;
        queryString += `ORDER BY ${sortBy} ${order}`;
        return db.query(queryString, valuesArr).then(({ rows }) => {
          return rows;
        });
      }
    });
  } else {
    queryString += `GROUP BY articles.article_id `;
    queryString += `ORDER BY ${sortBy} ${order}`;
    return db.query(queryString, valuesArr).then(({ rows }) => {
      return rows;
    });
  }
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



module.exports = { fetchArticlesById, fetchArticles, updateArticleVotes, checkIfTopicExists }
