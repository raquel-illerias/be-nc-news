const db = require("../db/connection");

function fetchCommentsByArticleId(articleId) {
    let queryString = `
        SELECT 
            comment_id,
            votes,
            created_at,
            author,
            body,
            article_id
        FROM
            comments
        WHERE
            article_id = $1
        ORDER BY
            created_at DESC
    `;
    return db
        .query(queryString, [articleId])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, message: "Not found" });
            }
            return rows;
        });
}

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

function addCommentByArticleId(articleId, author, body) {
    let queryString = `
        INSERT INTO 
            comments (body, article_id, author)
        VALUES 
            ($1, $2, $3) 
        RETURNING *
    `;
    
    return checkIfArticleExists(articleId)
        .then(() => {
            return db.query(queryString, [body, articleId, author]);
        })
        .then(({ rows }) => {
            return rows[0];
        });
}

module.exports = { fetchCommentsByArticleId, addCommentByArticleId };
