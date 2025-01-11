const { errorHandler } = require("../helpers/errorHandler");
const orderService = require("../services/orderService");
const userService = require("../services/userService");
const payOS = require("../services/payos");

class OrderController {
  constructor() {
    this.orderService = orderService;
  }

  getAll = async (req, res, next) => {
    try {
      const orders = await this.orderService.findAll();
      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const order = await this.orderService.findOneOrder(orderId);
      res.status(200).json({ data: order });
    } catch (error) {
      next(error);
    }
  };

  getOrdersForOneStadium = async (req, res, next) => {
    try {
      const stadiumId = req.params.stadiumId;
      const date = req.query.date;
      const orders = await this.orderService.findByOneStadium(stadiumId, date);
      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  };

  getOrdersForManager = async (req, res, next) => {
    try {
      req.user = {};
      const managerId = req.user.manager_id;
      const orders = await this.orderService.findSelfOrdersByManager(managerId);
      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  };

  getOrdersForPlayer = async (req, res, next) => {
    try {
      const playerId = req.user.player_id;
      const date = req.query.date;
      const orders = await this.orderService.findByOnePlayer(playerId, date);
      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  };

  getOrdersForOnePlayer = async (req, res, next) => {
    try {
      const playerId = req.params.playerId;
      const date = req.query.date;
      const orders = await this.orderService.findByOnePlayer(playerId, date);
      res.status(200).json({ data: orders });
    } catch (error) {
      next(error);
    }
  };

  createOrder = async (req, res, next) => {
    try {
      console.log('user: ', req.user);
      let playerId = req.user ? req.user.player_id : undefined;
      const { orders, note, fullName, phoneNumber, deposit } = req.body;
      // console.log('playerID', playerId);
      if (!playerId)
        playerId = await userService.savePlayerNoPassword({
          fullName,
          phoneNumber,
        });

      const stadiumId = req.params.stadiumId;

      if (!orders || orders.length == 0)
        return next(errorHandler(402, "orders can not be empty"));

      const bigOrder = orders.reduce((obj, order) => {
        obj.total_price = obj.total_price
          ? obj.total_price + order.price
          : order.price;
        obj.order_type = order.orderType;
        return obj;
      }, {});

      bigOrder.total_price = Math.floor((bigOrder.total_price * deposit) / 100);
      bigOrder.stadium_id = stadiumId;
      bigOrder.player_id = playerId;
      bigOrder.note = note;
      bigOrder.is_created_by_player = true;
      bigOrder.payment_status = "pending";
      bigOrder.deposit = deposit;

      console.log('bigOerder', bigOrder);

      const ordersToSave = orders.map((order) => {
        return this.convertOrderDetailCammelCase({
          ...order,
          stadiumId,
        });
      });
      const { orderId, orderDetailsIds } =
        await this.orderService.saveOrderWithDetails(bigOrder, ordersToSave);

      console.log(orderId, orderDetailsIds);
      try {
        const paymentLinkRes = await payOS.createPaymentLink({
          orderCode: orderId,
          amount: bigOrder.total_price,
          description: "note: " + note,
          cancelUrl: "localhost:3000/",
          returnUrl: "localhost:3000/",
        });
        res.status(200).json({ data: paymentLinkRes });
      } catch (error) {
        res.status(502).json({error: {
          message: error.message
        }})
      }
      
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const newOrderStatus = this.convertOrderDetailCammelCase(req.body);
      const updatedOrder = await this.orderService.updateOrder(
        orderId,
        newOrderStatus
      );
      res.status(200).json({ data: updatedOrder });
    } catch (error) {
      next(error);
    }
  };

  updateBigOrder = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const newOrder = req.body;
      const updatedOrder = await orderService.updateBigOrder(orderId, {
        payment_status: newOrder.paymentStatus,
      });
      const orderStatus =
        newOrder.paymentStatus == "paid" ? "success" : "canceled";
      await orderService.updateOrderDetailsFromBigOrder(orderId, {
        order_status: orderStatus,
      });
      res.status(200).json({ data: updatedOrder });
    } catch (error) {
      next(error);
    }
  };

  updateOrder = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const newOrder = this.convertOrderDetailCammelCase(req.body);
      const updatedOrder = await this.orderService.updateOrder(
        orderId,
        newOrder
      );
      res.status(200).json({ data: updatedOrder });
    } catch (error) {
      next(error);
    }
  };

  // convertOrderCammelCase (order){
  //     return {
  //         order_type: order.orderType,
  //         total_price: order.totalPrice,
  //         note: order.note,
  //         is_created_by_player: order.isCreatedByPlayer,
  //         player_id: order.playerId,
  //         stadium_id: order.stadiumId
  //     }
  // }

  convertOrderDetailCammelCase(orderDetails) {
    return {
      order_type: orderDetails.orderType,
      date: orderDetails.date,
      begin_time: orderDetails.beginTime,
      end_time: orderDetails.endTime,
      price: orderDetails.price,
      field_id: orderDetails.fieldId,

      order_id: orderDetails.orderId,
      stadium_id: orderDetails.stadiumId,
    };
  }
}

module.exports = new OrderController();
