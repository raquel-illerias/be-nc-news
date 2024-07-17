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
    `
    return db
        .query(queryString, [articleId])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, message: "Not found" });
            }
            return rows;
        })
}

module.exports = { fetchCommentsByArticleId }