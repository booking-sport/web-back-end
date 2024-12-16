const stadiumService = require('../services/stadiumService');

class StadiumController {
    constructor() {
        this.stadiumService = stadiumService;
    }

    getAll = async (req,res,next) => {
        try {
            const {stadiumType, name} = req.query;
            const stadiums = await this.stadiumService.findAll(stadiumType, name);
            res.status(200).json({data: stadiums});
        } catch (error) {
            next(error);
        }
    }

    getSelfStadium = async (req,res,next) => {
        try {
            // const managerId = req.user.manager_id;
            const managerId = 4;
            const stadiums = await this.stadiumService.findByMangerId(managerId);
            res.status(200).json({data: stadiums});
        } catch (error) {
            next(error);
        }
    }

    getOneStadium = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const stadium = await this.stadiumService.findById(stadiumId);
            res.status(200).json({data: stadium});
        } catch (error) {
            next(error);
        }
    }

    getFields = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const fields = await this.stadiumService.findFieldsByStadiumId(stadiumId);
            res.status(200).json({data: fields});
        } catch (error) {
            next(error);
        }
    }

    getPaymentInfo = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const info = await this.stadiumService.paymentInfo(stadiumId);
            res.status(200).json({data: info});
        } catch (error) {
            next(error);
        }
    }
    
    create = async (req,res,next) => {
        try {
            const stadiumCammelCase = req.body;
            const stadium = this.convertCammelCase(stadiumCammelCase);
            const newStadiumId = await this.stadiumService.saveStadium(stadium);
            res.status(200).json({data: newStadiumId});
        } catch (error) {
            next(error);
        }
    }

    addField = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const field = req.body;
            const newFieldId = await this.stadiumService.saveField(stadiumId, field);
            res.status(200).json({data: newFieldId});
        } catch (error) {
            next(error);
        }
    }

    addStaff = async (req,res,next) => {
        try {
            const {stadiumId, staffId} = req.params;
            await this.stadiumService.addStaff(stadiumId, staffId);
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }

    assignOwner = async(req,res,next) => {
        try {
            const {stadiumId, ownerId} = req.params;
            await this.stadiumService.assignOwner(stadiumId, ownerId);
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }

    removeStadium = async(req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            await this.stadiumService.deleteStadium(stadiumId);
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }

    removeStaff = async(req,res,next) => {
        try {
            const {stadiumId, staffId} = req.params;
            await this.stadiumService.removeStaff(stadiumId, staffId);
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }

    update = async (req,res,next) => {
        try {
            const stadiumId = req.params.stadiumId;
            const stadiumCammelCase = req.body;
            const stadium = this.convertCammelCase(stadiumCammelCase);
            const newStadium = await this.stadiumService.update(stadiumId, stadium);
            res.status(200).json({data: newStadium});
        } catch (error) {
            next(error);
        }
    }

    convertCammelCase(stadium) {
        return {
            stadium_type: stadium.stadiumType,
            name: stadium.name,
            address: stadium.address,
            longitude: stadium.longitude,
            latitude: stadium.latitude,
            award: stadium.award,
            strict: stadium.strict,
            province: stadium.province,
            open_time: stadium.openTime,
            close_time: stadium.closeTime,
            number_field: stadium.numberField,
            bank_account: stadium.bankAccount,
            bank: stadium.bank,
            images: stadium.images,
        }
    }
}

module.exports = new StadiumController();
