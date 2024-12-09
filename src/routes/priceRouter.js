const router = require('express').Router();
const priceController = require('../controllers/priceController');

router.get('/all/:stadiumId', priceController.getStadiumAllPrices);
router.get('/detail/:stadiumId', priceController.getPriceByDay);

router.post('/:stadiumId', priceController.create);

module.exports = router;