
const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');

class CommentService {
    constructor() {
        this.db = db;
    }

    findAll = async () => {
        try {
            return await this.db('comments').select('*');
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }    

    findById = async (commentId) => {
        try {
            return await this.db('comments').select('*').where('id', commentId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByStadiumId = async (stadiumId) => {
        try {
            return await this.db('comments').select('*').where('stadium_id', stadiumId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByPlayerId = async (playerId) => {
        try {
            return await this.db('comments').select('*').where('player_id', playerId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    saveComment = async (comment) => {
        try {
            const newComment = await this.db('comments').insert(comment);
            return newComment;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    deleteOneComment = async (commentId) => {
        try {
            await this.db('comments').where('id', commentId).delete();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    deleteAllComments = async () => {
        try {
            await this.db('comments').delete();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    deleteStadiumComments = async (stadiumId) => {
        try {
             await this.db('comments').where('stadium_id', stadiumId).delete();
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    updateComment = async (commentId, newComment) => {
        try {
            await this.db('comments').where('id', commentId).update(newComment);
            return await this.findById(commentId);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

}
module.exports = new CommentService();