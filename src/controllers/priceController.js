const { errorHandler } = require('../helpers/errorHandler');
const priceService = require('../services/priceService');

class PriceController{
    constructor(){
        this.priceService = priceService;
    }

    create = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const fieldId = req.params.fieldId;
            const data = req.body;
            const priceCammelCase = this.convertCammelCase(data);
            const priceToSave = {stadium_id: stadiumId, field_id: fieldId, ...priceCammelCase};
            const newPriceId = await this.priceService.saveAprice(priceToSave);
            res.status(200).json({data: newPriceId});
        } catch (error) {
            next(error);
        }
    }

    getStadiumAllPrices = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const prices = await this.priceService.findPriceByStadiumId(stadiumId);
            res.status(200).json({data: prices});
        } catch (error) {
            next(error);
        }
    }

    getPriceByDay = async (req,res,next) => {
        try {
            const {stadiumId} = req.params;
            console.log(req.query);
            const {dayOfWeek, orderType, date} = req.query;
            // console.log(date, dayOfWeek);
            // if(!date) return next(errorHandler(401, 'date is not valid or empty'));
            
            const prices = await this.priceService.detailDailyPriceByStadiumId(stadiumId, dayOfWeek, orderType, date);
            res.status(200).json({data: prices});
        } catch (error) {
            next(error);
        }
    }

    convertCammelCase(price) {
        return {
            order_type: price.orderType,
            day_of_week: price.dayOfWeek,
            begin_shift: price.beginShift,
            end_shift: price.endShift,
            unit_time: price.unitTime,
            price_per_unit: price.pricePerUnit,
            enable_deposit: price.enableDeposit,
            deposit_price_per_unit: price.depositPerPriceUnit
        }
    }
}

module.exports = new PriceController();