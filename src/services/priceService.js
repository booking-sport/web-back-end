const db = require('../config/dbConfig');
const { errorHandler } = require('../helpers/errorHandler');

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

    detailDailyPriceByStadiumId = async (stadiumId, dayOfWeek = 'monday', orderType = 'single_booking') => {
        try {
            const conditions = {
                stadium_id: stadiumId,
            }
            if(dayOfWeek) conditions['day_of_week'] = dayOfWeek;
            if(orderType) conditions['order_type'] = orderType;

            const records = await this.db('prices')
                                        .select('*')
                                        .where(conditions)
        
            const defaultPrice = 100;
            const detailPrices = Array(48).fill(defaultPrice);

            records.forEach((record) => {
                const beginShift = record.begin_shift;
                const hourBegin = parseInt(beginShift.slice(0,2)), minuteBegin = parseInt(beginShift.slice(3,5));
                const endShift = record.end_shift;
                const hourEnd = parseInt(endShift.slice(0,2)), minuteEnd = parseInt(endShift.slice(3,5));

                const startIndex = hourBegin*2 + minuteBegin/30;
                const endIndex = hourEnd*2 + minuteEnd/30;

                for(let i = startIndex; i < endIndex; i++){
                    detailPrices[i] = record.price_per_unit;
                }
            });
            
            return detailPrices;
        } catch (error) {
            throw errorHandler(503, error.message);
        }
    }

    // return an array with length = 48
    // detailFixOrderPriceByStadiumIdAndDay = async (stadiumId, dayOfWeek, orderType) => {
    //     try {
    //         const conditions = {
    //             stadium_id: stadiumId,
    //             day_of_week: dayOfWeek,
    //             order_type: orderType
    //         }
    //         const records = await this.db('prices')
    //                                     .select('*')
    //                                     .where(conditions)
    
    //         const detailPrices = Array(48).fill(undefined);

    //         records.forEach((record) => {
    //             const beginShift = record.begin_shift;
    //             const hourBegin = parseInt(beginShift.slice(0,2)), minuteBegin = parseInt(beginShift.slice(3,5));
    //             const endShift = record.end_shift;
    //             const hourEnd = parseInt(endShift.slice(0,2)), minuteEnd = parseInt(endShift.slice(3,5));

    //             const startIndex = hourBegin*2 + minuteBegin/30;
    //             const endIndex = hourEnd*2 + minuteEnd/30;

    //             for(let i = startIndex; i < endIndex; i++){
    //                 detailPrices[i] = record.price_per_uinit;
    //             }
    //         });

    //         return detailPrices;
    //     } catch (error) {
    //         throw errorHandler(503, error.message);
    //     }
    // }

}
module.exports = new PriceService();