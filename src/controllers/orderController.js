const orderService = require('../services/orderService');

class OrderController {
    constructor(){
        this.orderService = orderService;
    }

    getAll = async(req,res,next) => {
        try {
            const orders = await this.orderService.findAll();
            res.status(200).json({data: orders});
        } catch (error) {
            next(error);
        }
    }

    getOne = async(req,res,next) => {
        try {
            const orderId = req.params.orderId;
            const order = await this.orderService.findOneOrder(orderId);
            res.status(200).json({data: order});
        } catch (error) {
            next(error);
        }
    }

    getOrdersForOneStadium = async(req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const orders = await this.orderService.findByOneStadium(stadiumId);
            res.status(200).json({data: orders});
        } catch (error) {
            next(error);
        }
    }

    getOrdersForManager = async(req,res,next) => {
        try {
            req.user = {};
            const managerId = req.user.manager_id || 1;
            // console.log(managerId);
            const orders = await this.orderService.findSelfOrdersByManager(managerId);
            res.status(200).json({data: orders});
        } catch (error) {
            next(error);
        }
    }

    getOrdersForPlayer = async (req,res,next) => {
        try {
            const playerId = req.user.player_id || 1;
            const orders = await this.orderService.findByOnePlayer(playerId);
            res.status(200).json({data: orders});
        } catch (error) {
            next(error);
        }
    }

    createOrder = async (req,res,next) => {
        try {
            const orderCammelCase = req.body;
            const order = this.convertOrderCammelCase(orderCammelCase);
            console.log(order);
            const newOrderId = await this.orderService.saveOrder(order);
            res.status(200).json({data: newOrderId});
        } catch (error) {
            next(error);
        }
    }

    createOrderDetails = async (req,res,next) => {
        try {
            const orderDetailsCammelCase = req.body;
            const orderDetails = this.convertOrderDetailCammelCase(orderDetailsCammelCase);
            const newOrderId = await this.orderService.saveOrderDetails(orderDetails);
            res.status(200).json({data: newOrderId});
        } catch (error) {
            next(error);
        }
    }

    updateOrderStatus = async (req,res,next) => {
        try {
            const orderId = req.params.orderId;
            const newOrderStatus = this.convertOrderDetailCammelCase(req.body);
            const updatedOrder = await this.orderService.updateOrder(orderId, newOrderStatus);
            res.status(200).json({data: updatedOrder});
        } catch (error) {
            next(error);
        }
    }

    updateOrder = async (req,res,next) => {
        try {
            const orderId = req.params.orderId;
            const newOrder = this.convertOrderDetailCammelCase(req.body);
            const updatedOrder = await this.orderService.updateOrder(orderId, newOrder);
            res.status(200).json({data: updatedOrder});
        } catch (error) {
            next(error);
        }
    }

    convertOrderCammelCase (order){
        return {
            order_type: order.orderType,
            total_price: order.totalPrice,
            note: order.note,
            is_created_by_player: order.isCreatedByPlayer,
            player_id: order.playerId,
            stadium_id: order.stadiumId
        }
    }

    convertOrderDetailCammelCase (orderDetails) {
        return {
            order_type: orderDetails.orderType,
            date: orderDetails.date,
            begin_time: orderDetails.beginTime,
            end_time: orderDetails.endTime,
            price: orderDetails.price,
            order_id: orderDetails.orderId,
            field_id: orderDetails.fieldId,
            order_status: orderDetails.orderStatus
        }
    }
}

module.exports = new OrderController();