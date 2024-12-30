const router = require("express").Router();
const payOS = require("../services/payos");

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
