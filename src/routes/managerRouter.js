const router = require('express').Router();
const managerController = require('../controllers/managerController');
const { isAdmin, verifyToken } = require('../middlewares/auth');

router.get('/all', managerController.getAll);
router.get('/:managerId', managerController.getById);

router.post('/', managerController.create);
router.post('/login', managerController.login);
router.post('/logout', managerController.logOut);

router.put('/:managerId', managerController.update);

router.delete('/:managerId', verifyToken,isAdmin, managerController.delete);
module.exports = router;