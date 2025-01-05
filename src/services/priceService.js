const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');
const orderService = require('./orderService');
const stadiumService = require('./stadiumService');

class PriceService {
    constructor(){
        this.db = db;
    }

    saveAprice = async (price) => {
        try {
            const newPriceId = await this.db('prices').insert(price);
            return newPriceId;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    findById = async (priceId) => {
        try {
            const price = await this.db('prices').select('*').where('id', priceId).first();
            return price;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }
    
    // filter prices by stadium
    findPriceByStadiumId = async (stadiumId) => {
        try {
            const prices = await this.db('prices').select('*').where('stadium_id',stadiumId);
            return prices;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    //return details price for each unit on specific day -> 24 * 2  record 
    // return an array, length = 48


    detailDailyPriceByStadiumId_version2 = async (stadiumId, date, dayOfWeek = 'monday', orderType = 'single_booking') => {
        try {
            const conditions = this.buildConditions(stadiumId, dayOfWeek, orderType);
            console.log('....', conditions);
            const [prices, orders, fields] = await Promise.all([
                this.db('prices').select('*').where(conditions),
                orderService.findOrderSuccessToday(stadiumId, date),
                stadiumService.findFieldsByStadiumId(stadiumId),
            ]);

            const unitPrices = this.mapUnitPrices(prices);
            const unitOrders = this.mapUnitOrders(orders);

            return this.buildFieldUnitPrices(fields, unitPrices, unitOrders);
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    buildConditions(stadiumId, dayOfWeek, orderType) {
        const conditions = { stadium_id: stadiumId };
        if (dayOfWeek) conditions['day_of_week'] = dayOfWeek;
        if (orderType) conditions['order_type'] = orderType;
        return conditions;
    }

    mapUnitPrices(prices) {
        const unitPrices = {};
        prices.forEach(price => {
            const [startIndex, endIndex] = this.calculateTimeIndices(price.begin_shift, price.end_shift);
            const fieldId = price.field_id;

            unitPrices[fieldId] = unitPrices[fieldId] || Array(48).fill(null);
            for (let i = startIndex; i < endIndex; i++) {
                unitPrices[fieldId][i] = price.price_per_unit;
            }
        });
        return unitPrices;
    }

    mapUnitOrders(orders) {
        const unitOrders = {};
        orders.forEach(order => {
            const [startIndex, endIndex] = this.calculateTimeIndices(order.begin_time, order.end_time);
            const fieldId = order.field_id;

            unitOrders[fieldId] = unitOrders[fieldId] || Array(48).fill(null);
            for (let i = startIndex; i < endIndex; i++) {
                unitOrders[fieldId][i] = order.order_type;
            }
        });
        return unitOrders;
    }

    calculateTimeIndices(startTime, endTime) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);

        const startIndex = start.hours * 2 + start.minutes / 30;
        const endIndex = end.hours * 2 + end.minutes / 30;

        return [startIndex, endIndex];
    }

    parseTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return { hours, minutes };
    }

    buildFieldUnitPrices(fields, unitPrices, unitOrders) {
        return fields.map(field => {
            const fieldId = field.id;
            const fieldName = field.name;
            const priceData = unitPrices[fieldId] || Array(48).fill(null);
            const orderData = unitOrders[fieldId] || Array(48).fill(null);

            const unit = this.buildFieldUnits(priceData, orderData);
            return { fieldId, fieldName, unit };
        });
    }

    buildFieldUnits(priceData, orderData) {
        return Array.from({ length: 48 }, (_, i) => {
            const rangeTime = this.calculateRangeTime(i);
            const price = priceData[i];
            const orderType = orderData[i];
            const status = this.determineStatus(price, orderType);

            return { price, status, order_type: orderType, rangeTime };
        });
    }

    calculateRangeTime(index) {
        const start = this.formatTime(index);
        const end = this.formatTime(index + 1);
        return `${start} to ${end}`;
    }

    formatTime(index) {
        const hours = Math.floor(index / 2).toString().padStart(2, '0');
        const minutes = (index % 2) * 30 === 0 ? '00' : '30';
        return `${hours}:${minutes}`;
    }

    determineStatus(price, orderType) {
        if (price) return orderType ? 'booked' : 'available';
        return 'block';
    }

}
module.exports = new PriceService();