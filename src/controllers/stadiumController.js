const stadiumService = require('../services/stadiumService');

class StadiumController {
    constructor() {
        this.stadiumService = stadiumService;
    }

    getAll = async (req,res,next) => {
        try {
            const stadiums = await this.stadiumService.findAll();
            res.status(200).json({stadiums});
        } catch (error) {
            next(error);
        }
    }

    getSelfStadium = async (req,res,next) => {
        try {
            const managerId = req.user.manager_id;
            const stadiums = await this.stadiumService.findByMangerId(managerId);
            res.status(200).json({stadiums});
        } catch (error) {
            next(error);
        }
    }
    
    create = async (req,res,next) => {
        try {
            const stadiumCammelCase = req.body;
            const stadium = this.convertCammelCase(stadiumCammelCase);
            const newStadiumId = await this.stadiumService.saveStadium(stadium);
            res.status(200).json({new_stadium_id: newStadiumId});
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
            res.status(200).json({new_stadium: newStadium});
        } catch (error) {
            next(error);
        }
    }

    convertCammelCase(stadium) {
        return {
            stadium_type: stadium.stdiumType,
            name: stadium.name,
            address: stadium.address,
            longtitue: stadium.longtitue,
            latitue: stadium.latitue,
            strict: stadium.strict,
            province: stadium.province,
            open_time: stadium.openTime,
            close_time: stadium.closeTime,
            bank_account: stadium.bankAccount,
            bank: stadium.bank,
            images: stadium.images,
        }
    }
}

module.exports = new StadiumController();
