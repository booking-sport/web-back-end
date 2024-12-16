const bcryptjs = require('bcryptjs');
const { errorHandler } = require('../helpers/errorHandler');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');

class PlayerController {
    constructor() {
        this.userService = UserService;
        this.authService = AuthService;
    }

    getAll = async (req,res,next) => {
        try {
            const players = await this.userService.findAllPlayer();
            res.status(200).json({data: players});
        } catch (error) {
            next(error);
        }
    }

    getById = async (req,res,next) => {
        try {
            const playerId = req.params.playerId;
            const player = await this.userService.findPlayerbyId(playerId);
            res.status(200).json({data: player});
        } catch (error) {
            next(error);
        }
    }

    create = async (req,res,next) => {
        try {
            const {fullName, email, password, phoneNumber} = req.body;

            const playerWithEmail = await this.userService.findPlayerbyEmail(email);
            if(playerWithEmail) return next(errorHandler(401, 'email is existed'));

            const hashedPassword = bcryptjs.hashSync(password);
            const newPlayerId = await this.userService.savePlayer({fullName, email, hashedPassword, phoneNumber});

            const userTokenData = {player_id: newPlayerId, full_name: fullName, email, phone_number: phoneNumber};
            const token = this.authService.signToken(userTokenData);
            res.cookie('jwt', token);
            res.status(200).json({data: newPlayerId});
        } catch (error) {
            next(error);
        }
    }

    login = async (req,res,next) => {
        try {
            const {email, password} = req.body;
            if(!email || !password) return next(errorHandler(401, 'invalid email or password field'));

            const player = await this.userService.findPlayerbyEmail(email);
            if(!player) return next(errorHandler(403, 'email not found'));
            if(!bcryptjs.compareSync(password, player.password)) return next(errorHandler(403, 'password is invalid'));

            const userTokenData = {player_id: player.id, phone_number: player.phone_number, email, full_name: player.full_name};
            const token = this.authService.signToken(userTokenData);
           
            res.cookie('jwt', token);
            console.log(userTokenData);
            res.status(200).json(
                {
                data: {
                    token,
                    user: userTokenData,
                }
                });
        } 
        catch (error) {
            next(error);
        }
    }

    logOut = (req,res,next) => {
        try {
            res.clearCookie('jwt');
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }

    update = async (req,res,next) => {
        try {
            const playerId = req.params.playerId;
            const {fullName, email, password, phoneNumber} = req.body;

            let hashedPassword;
            if(password) hashedPassword = bcryptjs.hashSync(password);

            const newPlayer = await this.userService.updatePlayer({playerId,fullName,email,hashedPassword,phoneNumber});
            res.status(200).json({data: newPlayer});
        } catch (error) {
            next(error);
        }
    }

    delete = async (req,res,next) => {
        try {
            const playerId = req.params.playerId;
            await this.userService.deletePlayer(playerId);
            res.status(200).json({success: true});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PlayerController();