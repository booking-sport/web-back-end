
const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');

class CommentService {
    constructor() {
        this.db = db;
    }

    findAll = async () => {
        try {
            const rows = await this.db('comments').select('*');
            const allImages = await this.findImagesForAllComment();
            const comments = rows.map((row) => {
                const images = allImages[row.id] ? allImages[row.id] : [];
                return {
                    ...row,
                    images
                }
            });
            
            return comments;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }    

    findById = async (commentId) => {
        try {
            const basicInfo =  await this.db('comments').select('*').where('id', commentId).first();
            const allImages = await this.findImagesForAllComment();
            const images = allImages[commentId] ? allImages[commentId] : [];
            return {...basicInfo, images};
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByStadiumId = async (stadiumId) => {
        try {
            const rows = await this.db('comments').select('*').where('stadium_id', stadiumId);
            const allImages = await this.findImagesForAllComment();
            
            const comments = rows.map((row) => {
                const images = allImages[row.id] ? allImages[row.id] : [];
                return {
                    ...row,
                    images
                }
            });

            return comments;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


    findByPlayerId = async (playerId) => {
        try {
            const rows =  await this.db('comments').select('*').where('player_id', playerId);
            const allImages = await this.findImagesForAllComment();
            
            const comments = rows.map((row) => {
                const images = allImages[row.id] ? allImages[row.id] : [];
                return {
                    ...row,
                    images
                }
            });

            return comments;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findImagesForAllComment = async () => {
        try {
            const rows = await this.db('comments_images').select('*');

            const images = rows.reduce( (arr,row) => {
                const commentId = row.comment_id;
                if(!arr[commentId]) arr[commentId] = [];
                arr[commentId].push(row.image_path);
                return arr;
            }, {});

            return images;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    countRatingForStadium = async (stadiumId) => {
        try {
            const ratingCnt = await this.db('comments')
                                    .select('rate')
                                    .count('* as count')
                                    .groupBy('rate')
                                    .orderBy('rate');
            return ratingCnt;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }


    saveComment = async (comment) => {
        try {
            const {images, ...record} = comment;
            const rows = await this.db('comments').insert(record);
            const newCommentId = rows[0];
            if(images && images.length > 0) await this.saveImages(images, newCommentId);
            return newCommentId;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    saveImages = async(images, commentId) => {
        try {
            const records = images.map((url) => {
                return {
                    image_path: url,
                    comment_id: commentId
                }
            });
            await this.db('comments_images').insert(records);
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