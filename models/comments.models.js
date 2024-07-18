const db = require("../db/connection");
const { checkIfArticleExists, checkIfCommentExists } = require("./utils.models");

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

function removeComment(commentId) { 
    return checkIfCommentExists(commentId)
    .then((exists) => {
        if (!exists) {
            return Promise.reject({ status: 404, message: 'Not found' });
        } else {
            return db.query('DELETE FROM comments WHERE comment_id = $1', [commentId]);
        }
    });
}


module.exports = { fetchCommentsByArticleId, addCommentByArticleId, removeComment, checkIfCommentExists };
