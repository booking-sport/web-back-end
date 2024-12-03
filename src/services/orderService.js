const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');
const stadiumService = require('./stadiumService');

class OrderService {
    constructor(){
        this.db = db;
    }

    findAll = async () => {
        try {
            const orders = await this.db('order_details')
                                        .join('orders', 'order_details.order_id', 'orders.id')
                                        .select('orders_details.*', 'orders.stadium_id', 'orders.player_id');
            return orders;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findOneOrder = async (orderId) => {
        try {
            const order = await this.db('order_details')
                                        .join('orders', 'order_details.order_id', 'orders.id')
                                        .select('orders_details.*', 'orders.stadium_id', 'orders.player_id')
                                        .where('order_details.id', orderId)
                                        .first();
            return order;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByOneStadium = async (stadiumId) => {
        try {
            const orders = await this.db('order_details')
                                        .join('orders', 'order_details.order_id', 'orders.id')
                                        .select('orders_details.*', 'orders.stadium_id', 'orders.player_id')
                                        .where('orders.stadium_id', stadiumId);
                                        
            return orders;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByListStadium = async (stadiumIds) => {
        try {
            const orders = await this.db('order_details')
                                        .join('orders', 'order_details.order_id', 'orders.id')
                                        .select('orders_details.*', 'orders.stadium_id', 'orders.player_id')
                                        .whereIn('orders.stadium_id', stadiumIds);
                                        
            return orders;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findSelfOrdersByManager = async (managerId) => {
        try {
            const stadiums = await stadiumService.findByMangerId(managerId);
            const stadimIds = stadiums.map((ele) => ele.id);
            return await this.findByListStadium(stadimIds);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findByOnePlayer = async (playerId) => {
        try {
            const orders = await this.db('order_details')
                                        .join('orders', 'order_details.order_id', 'orders.id')
                                        .select('orders_details.*', 'orders.stadium_id', 'orders.player_id')
                                        .where('orders.player_id', playerId);
                                        
            return orders;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    saveOrder = async (order) => {
        try {
            const orderId = await this.db('orders').insert(order);
            return orderId;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    saveOrderDetails = async (orderDetails) => {
        try {
            const orderDetailsId = await this.db('order_details').insert(orderDetails);
            return orderDetailsId;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    updateOrder = async (orderId, newOrder) => {
        try {
            await this.db('order_details').where('id', orderId).update(newOrder);
            return await this.findOneOrder(orderId); 
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

}

module.exports = new OrderService();