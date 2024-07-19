const db = require("../db/connection");

function checkIfArticleExists(articleId) {
    let queryString = `
        SELECT 1
        FROM articles
        WHERE article_id = $1
    `;
    return db.query(queryString, [articleId]).then(({ rowCount }) => {
        if (rowCount === 0) {
            return Promise.reject({ status: 404, message: "Article not found" });
        }
    });
}

function checkIfCommentExists(commentId) {
    return db.query('SELECT * FROM comments WHERE comment_id = $1', [commentId])
    .then(({ rows }) => {
        return rows.length === 1;
    });
}

function checkIfTopicExists(topic) {  
    return db.query(`SELECT * FROM topics WHERE slug = $1`, [topic])
    .then (({rows}) => {
        if(rows.length === 0) {
            return false
        }
        return true
    });
}

module.exports = { checkIfArticleExists, checkIfCommentExists, checkIfTopicExists }