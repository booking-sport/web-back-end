const priceService = require('../services/priceService');

class PriceController{
    constructor(){
        this.priceService = priceService;
    }

    create = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const data = req.body;
            const priceCammelCase = this.convertCammelCase(data);
            const priceToSave = {stadium_id: stadiumId, ...priceCammelCase};
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
            const {dayOfWeek, orderType} = req.query;
            console.log(stadiumId, dayOfWeek);

            const prices = await this.priceService.detailDailyPriceByStadiumId(stadiumId, dayOfWeek, orderType);
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