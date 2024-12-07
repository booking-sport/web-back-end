const router = require('express').Router();
const stadiumController = require('../controllers/stadiumController');

router.get('/all', stadiumController.getAll);
router.get('/manager', stadiumController.getSelfStadium);
router.get('/:stadiumId', stadiumController.getOneStadium);

router.post('/', stadiumController.create);
router.post('/:stadiumId/staff/:staffId', stadiumController.addStaff);
router.post('/:stadiumId/owner/:ownerId', stadiumController.assignOwner);

router.delete('/:stadiumId', stadiumController.removeStadium);
router.delete('/:stadiumId/staff/:staffId', stadiumController.removeStaff);

router.put('/:stadiumId', stadiumController.update);

module.exports = router;