const bcryptjs = require('bcryptjs');
const { errorHandler } = require('../helpers/errorHandler');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');

class ManagerController {
    constructor() {
        this.authService = AuthService;
        this.userService = UserService;
    }

    getAll = async (req,res,next) => {
        try {
            const managers = await this.userService.findAllManager();
            res.status(200).json({data: managers});
        } catch (error) {
            next(error);
        }
    }

    getById = async (req,res,next) => {
        try {
            const managerId = req.params.managerId;
            const manager = await this.userService.findManagerbyId(managerId);
            res.status(200).json({data: manager});
        } catch (error) {
            next(error);
        }
    }
    
    create = async (req,res,next) => {
        try {
            const {fullName, email, password, phoneNumber} = req.body;

            const maangerWithEmail = await this.userService.findManagerbyEmail(email);
            if(maangerWithEmail) return next(errorHandler(401, 'email is existed'));

            const hashedPassword = bcryptjs.hashSync(password);
            const newManagerId = await this.userService.saveManager({fullName, email, hashedPassword, phoneNumber});
            
            res.status(200).json({data: newManagerId});
        } catch (error) {
            next(error);
        }
    }

    login = async (req,res,next) => {
        try {
            const {email, password} = req.body;

            const manager = await this.userService.findPlayerbyEmail(email);
            if(!manager) return next(errorHandler(403, 'email not found'));
            
            const hashedPassword = bcryptjs.hashSync(password);
            if(hashedPassword != manager.password) return next(errorHandler(403, 'password is invalid'));

            const userTokenData = {manager_id: manager.id, phone_number: manager.phone_number, email, full_name: manager.full_name, role: manager.role};
            const token = this.authService.signToken(userTokenData);

            res.cookie('jwt', token);
            res.status(200).json({data: token});
        } 
        catch (error) {
            next(error);
        }
    }

    logOut = (req,res,next) => {
        try {
            res.clearCookie('jwt');
            res.status(200).json({succeess: true});
        } catch (error) {
            next(error);
        }
    }

    update = async (req,res,next) => {
        try {
            const managerId = req.params.managerId;
            const {fullName, email, password, phoneNumber, role} = req.body;

            let hashedPassword;
            if(password) hashedPassword = bcryptjs.hashSync(password);

            const newManager = await this.userService.updateManager({managerId,fullName,email,hashedPassword,phoneNumber, role});
            res.status(200).json({data: newManager});
        } catch (error) {
            next(error);
        }
    }

    delete = async (req,res,next) => {
        try {
            const managerId = req.params.managerId;
            await this.userService.deleteManager(managerId);
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new ManagerController();