const router = require('express').Router();
const orderController = require('../controllers/orderController');
const {verifyToken, decodeToken} = require('../middlewares/auth')

router.get('/all', orderController.getAll);
router.get('/:orderId', orderController.getOne);
router.get('/stadium/:stadiumId', orderController.getOrdersForOneStadium);
router.get("/player/:playerId", orderController.getOrdersForOnePlayer);
router.get('/self/manager', orderController.getOrdersForManager);
router.get('/self/player', verifyToken, orderController.getOrdersForPlayer);


router.post("/stadium/:stadiumId", decodeToken, orderController.createOrder);


//just to update status from player
router.put('/detail/:orderId', orderController.updateOrder);
router.put("/:orderId", orderController.updateBigOrder);
// update order only for manager
router.put('/manager/:orderId', orderController.updateOrder);

module.exports = router;