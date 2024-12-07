const router = require('express').Router();
const playerController = require('../controllers/playerController');

router.get('/all', playerController.getAll);
router.get('/:playerId', playerController.getById);

router.post('/', playerController.create);
router.post('/login', playerController.login);
router.post('/logout', playerController.logOut);

router.put('/:playerId', playerController.update);

router.delete('/:playerId', playerController.delete)
module.exports = router;