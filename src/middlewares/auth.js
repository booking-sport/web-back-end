const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');
const orderService = require('../services/orderService');
const stadiumService = require('../services/stadiumService');

exports.verifyToken = (req,res,next) => {
    const token = req.cookie.jwt;
    if(!token) return next(errorHandler(403, 'token not found'));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if(err) return next(errorHandler(403, 'token is invalid'));
        req.user = user;
        next();
    });
}

exports.decodeToken = (req,res,next) => {
    const token = req.cookie.jwt;
    if(!token) return next();

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if(err) return next(errorHandler(403, 'token is invalid'));
        req.user = user;
        next();
    });
}

exports.isPlayer = (req,res,next) => {
    const user = req.user;
    if(!user) return next(errorHandler(403, 'user not autenicated'));
    const playerId = user.player_id;
    if(!playerId) return next(errorHandler(403, 'not player role'));
    next();
}


exports.isAdmin = (req,res,next) => {
    const adminId = req.user.admin_id;
    if(!adminId) return next(errorHandler(403, 'not admin system'));
    next();
}

exports.isManager = (req,res,next) => {
    const manager_id = req.user.manager_id;
    if(!manager_id) return next(errorHandler(403, 'not a stadium manager'));
    next();
}

exports.isOwner = (req,res,next) => {
    const role = req.user.role;
    if(role != 'owner') return next(errorHandler(403, 'not an stadium owner'));
    next();
}


exports.isStaff = (req,res,next) => {
    const role = req.user.role;
    if(role != 'staff') return next(errorHandler(403, 'not a stadium staff'));
    next();
}

exports.isSelfPlayer = (req,res,next) => {
    const playerId = req.params.playerId;
    const currentPlayerId = req.user.player_id;
    if(playerId != currentPlayerId) return next(errorHandler(403, 'not this player'));
    next();
}

exports.isSelfAdmin = (req,res,next) => {
    const managerId = req.params.managerId;
    const currentManagerId = req.user.manager_id;
    if(managerId != currentManagerId) return next(errorHandler(403, 'not this manager'));
    next();
}

//check if user is manager of this stadium
exports.isManagerStadium = async (req,res,next) => {
    const user = req.user;
    const managerId = user.manager_id;
    if(!managerId) return next(errorHandler(403, 'not a stadium manager'));

    const stadiumId = req.params.stadiumId;
    const managers = await stadiumService.findManagerById(stadiumId);
    if(!managers.includes(managerId)) return next(errorHandler(403, 'not this stadium manager'));
    next();
}

//check if user is player own this order
exports.isPlayerOrder = async (req,res,next) => {
    const orderId = req.params.orderId;
    const playerId = req.user.player_id;

    const order  = await orderService.findOneOrder(orderId);
    if(order.player_id != playerId) return next(errorHandler(401, 'player not own this order'));
    next();
}

exports.isManagerOrder = async(req,res,next) => {
    const orderId = req.params.orderId;
    const managerId = req.params.maanger_id;

    const orders = await orderService.findSelfOrdersByManager(managerId);
    const orderIds = orders.map(order => order.id);
    if(!orderIds.includes(orderId)) return next(errorHandler(401, 'manager not own this order'));
    next();
}








