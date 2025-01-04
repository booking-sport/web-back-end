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

    detailDailyPriceByStadiumId = async (stadiumId, date, dayOfWeek = 'monday', orderType = 'single_booking') => {
        try {
            const conditions = {
                stadium_id: stadiumId,
            }
            if(dayOfWeek) conditions['day_of_week'] = dayOfWeek;
            if(orderType) conditions['order_type'] = orderType;

            const prices = await this.db('prices')
                                        .select('*')
                                        .where(conditions)
            
            const orders = await orderService.findOrderSuccessToday(stadiumId, date);
            const fields = await stadiumService.findFieldsByStadiumId(stadiumId);

            console.log(orders);

        
            let unitPrices = {};
            let unitOrders = {};

            prices.forEach((price) => {
                const beginShift = price.begin_shift;
                const hourBegin = parseInt(beginShift.slice(0,2)), minuteBegin = parseInt(beginShift.slice(3,5));
                const endShift = price.end_shift;
                const hourEnd = parseInt(endShift.slice(0,2)), minuteEnd = parseInt(endShift.slice(3,5));

                const startIndex = hourBegin*2 + minuteBegin/30;
                const endIndex = hourEnd*2 + minuteEnd/30;

                const fieldId = price.field_id;
                if(!unitPrices[fieldId]) unitPrices[fieldId] = Array(48).fill(null);

                for(let i = startIndex; i < endIndex; i++){
                    unitPrices[fieldId][i] = price.price_per_unit;
                }
            });


            orders.forEach((order) => {
                const beginTime = order.begin_time;
                const hourBegin = parseInt(beginTime.slice(0,2)), minuteBegin = parseInt(beginTime.slice(3,5));
                const endTime = order.end_time;
                const hourEnd = parseInt(endTime.slice(0,2)), minuteEnd = parseInt(endTime.slice(3,5));

                const startIndex = hourBegin*2 + minuteBegin/30;
                const endIndex = hourEnd*2 + minuteEnd/30;

                const fieldId = order.field_id;
                console.log(fieldId);
                if(!unitOrders[fieldId]) unitOrders[fieldId] = Array(48).fill(null);

                for(let i = startIndex; i < endIndex; i++){
                    unitOrders[fieldId][i] = order.order_type;
                }
            });


            let price = null, status = null, _orderType = null;

            const fieldUnitPrices = fields.map((field) => {

                let unit = Array(48).fill({});

                const fieldId = field.id;
                const fieldName = field.name;
                const priceNow = unitPrices[fieldId];
                const orderNow = unitOrders[fieldId];

                // test
                let startTime, endTime, rangeTime;
                // co set gia cho san nay
                if(priceNow){
                    for(let i=0; i<48; i++){
                        let hours = Math.floor(i / 2).toString().padStart(2, '0');
                        let minutes = (i % 2) * 30 === 0 ? '00' : '30';
                        startTime = `${hours}:${minutes}`;
                        hours = Math.floor((i+1) / 2).toString().padStart(2, '0');
                        minutes = ((i+1) % 2) * 30 === 0 ? '00' : '30';
                        endTime = `${hours}:${minutes}`;
                        rangeTime = `${startTime} to ${endTime}`;

                        if(priceNow[i]){
                            price = priceNow[i];
                            if(orderNow && orderNow[i]){
                                status = 'booked';
                                _orderType = orderNow[i];
                            }
                            else {
                                status = 'available';
                                _orderType = null;
                            }
                        }
                        else {
                            price = null;
                            status = 'block';
                            _orderType = null;
                        }
                        unit[i] = {
                            price,
                            status,
                            "order_type": _orderType,
                            rangeTime
                        }
                    }
                }
                else {
                    for(let i=0; i<48; i++){
                        let hours = Math.floor(i / 2).toString().padStart(2, '0');
                        let minutes = (i % 2) * 30 === 0 ? '00' : '30';
                        startTime = `${hours}:${minutes}`;
                        hours = Math.floor((i+1) / 2).toString().padStart(2, '0');
                        minutes = ((i+1) % 2) * 30 === 0 ? '00' : '30';
                        endTime = `${hours}:${minutes}`;
                        rangeTime = `${startTime} to ${endTime}`;
                        
                        unit[i] = {
                            price: null,
                            status: 'block',
                            "order_type": null,
                            rangeTime
                        }
                    }
                }
                
                return {
                    fieldId,
                    fieldName,
                    unit
                }
            });
            
            return fieldUnitPrices;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    detailDailyPriceByStadiumId_version2 = async (stadiumId, date, dayOfWeek = 'monday', orderType = 'single_booking') => {
        try {
            const conditions = this.buildConditions(stadiumId, dayOfWeek, orderType);
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