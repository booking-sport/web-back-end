const router = require('express').Router();
const priceController = require('../controllers/priceController');

router.get('/all/:stadiumId', priceController.getStadiumAllPrices);
router.get('/detail/:stadiumId', priceController.getPriceByDay);

router.post('/stadium/:stadiumId/field/:fieldId', priceController.create);

module.exports = router;