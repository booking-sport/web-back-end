const router = require('express').Router();
const stadiumController = require('../controllers/stadiumController');
const stadiumService = require('../services/stadiumService');

router.get('/all', stadiumController.getAll);
router.get('/manager', stadiumController.getSelfStadium);
router.get('/:stadiumId', stadiumController.getOneStadium);
router.get('/:stadiumId/fields', stadiumController.getFields);
router.get('/:stadiumId/payment-info', stadiumController.getPaymentInfo);

router.post('/', stadiumController.create);
router.post('/:stadiumId/field', stadiumController.addField);
router.post('/:stadiumId/staff/:staffId', stadiumController.addStaff);
router.post('/:stadiumId/owner/:ownerId', stadiumController.assignOwner);

router.delete('/:stadiumId', stadiumController.removeStadium);
router.delete('/:stadiumId/staff/:staffId', stadiumController.removeStaff);

router.put('/:stadiumId', stadiumController.update);

module.exports = router;