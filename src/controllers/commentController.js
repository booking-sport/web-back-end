const { errorHandler } = require('../helpers/errorHandler');
const commentService = require('../services/commentService');

class CommentController {
    constructor() {
        this.commentService = commentService;
    }

    getAll = async (req,res,next) => {
        try {
            const comments = await this.commentService.findAll();
            res.status(200).json({data: comments});
        } catch (error) {
            next(error);
        }
    }

    getOne = async (req,res,next) => {
        try {
            const commentId = req.params.commentId;
            const comment = await this.commentService.findById(commentId);
            res.status(200).json({data: comment});
        } catch (error) {
            next(error);
        }
    }

    getByStadiumId = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const comments = await this.commentService.findByStadiumId(stadiumId);
            res.status(200).json({data: comments});
        } catch (error) {
            next(error);
        }
    }

    getByPlayerId = async (req,res,next) => {
        try {
            const playerId = req.params.playerId;
            const comments = await this.commentService.findByPlayerId(playerId);
            res.status(200).json({data: comments});
        } catch (error) {
            next(error);
        }
    }

    create = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            // const playerId = req.user.player_id;
            const playerId = 7;
            const {comment, rate, images} = req.body;

            const newRecord = {comment, rate, stadium_id: stadiumId, player_id: playerId, images};
            const newComment = await this.commentService.saveComment(newRecord);

            res.status(200).json({data: newComment});
        } catch (error) {
            next(error);
        }
    }

    deleteOne = async (req,res,next) => {
        try {
            const playerId = req.user.player_id;
            const commentId = req.params.commentId;
            const deletedBy = playerId ? 'player' : 'admin';
            playerId ? await this.commentService.updateComment(commentId, {is_deleted: true})
                    : await this.commentService.deleteOneComment(commentId);
            res.status(200).json({success: true, deleted_by: deletedBy});
        } catch (error) {
            next(error);
        }
    }

    deleteStadiumComments = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            await this.commentService.deleteStadiumComments(stadiumId);
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }

    update = async (req,res,next) => {
        try {
            const commentId = req.params.commentId;
            const {rate, comment} = req.body;
            const newComment = await this.commentService.updateComment(commentId, {rate, comment});
            res.status(200).json({data: newComment});
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new CommentController();