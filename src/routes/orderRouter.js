const router = require('express').Router();
const orderController = require('../controllers/orderController');

router.get('/all', orderController.getAll);
router.get('/:orderId', orderController.getOne);
router.get('/stadium/:stadiumId', orderController.getOrdersForOneStadium);
router.get('/self/manager', orderController.getOrdersForManager);
router.get('/self/player', orderController.getOrdersForPlayer);


router.post('/', orderController.createOrder);
router.post('/details', orderController.createOrderDetails);

//just to update status from player
router.put('/:orderId', orderController.updateOrder);
// update order only for manager
router.put('/manager/:orderId', orderController.updateOrder);

module.exports = router;