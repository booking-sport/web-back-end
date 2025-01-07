const router = require('express').Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/auth');

router.get('/all', commentController.getAll);
router.get('/:commentId', commentController.getOne);      
router.get('/stadium/:stadiumId', commentController.getByStadiumId);
router.get('/player/:playerId', commentController.getByPlayerId);

router.post('/:stadiumId', verifyToken ,commentController.create); 

router.delete('/:commentId', commentController.deleteOne);
router.delete('/stadium/:stadiumId/all', commentController.deleteStadiumComments);

router.put('/:commentId', commentController.update);

module.exports = router;