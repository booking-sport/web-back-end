const router = require('express').Router();
const orderService = require('../services/orderService');

// https://0f9f-171-241-47-243.ngrok-free.app/receive-hook
router.post("/receive-hook", async (req, res) => {
  const order = req.body;
  const success = order.success;
  if(success) {
    const orderId = order.data.orderCode;
    await orderService.updateBigOrder(orderId, {order_status: 'success'});
  }
});

module.exports = router;