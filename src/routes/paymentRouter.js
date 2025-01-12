const router = require("express").Router();
const payOS = require("../services/payos");
const orderService = require("../services/orderService");


router.get("/statistic", async (req,res,next) => {
  try {
    const records  = await orderService.getSubscriptionByMonth();
    res.status(200).json({data: records});
  } catch (error) {
    next(error);
  }
})

router.get("/:orderId", async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await payOS.getPaymentLinkInformation(orderId);
    if (!order) {
      return res.json({
        error: -1,
        message: "failed",
        data: null,
      });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
