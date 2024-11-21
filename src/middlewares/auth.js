const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');

exports.verifyToken = (req,res,next) => {
    const token = req.cookie.jwt;
    if(!token) return next(errorHandler(403, 'token not found'));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if(err) return next(errorHandler(403, 'token is invalid'));
        req.user = user;
        next();
    });
}

exports.isOwner = (req,res,next) => {
    const role = req.user.role;
    if(role != 'owner') return next(errorHandler(403, 'not owner stadium'));
    next();
}

exports.isStaff = (req,res,next) => {
    const role = req.user.role;
    if(role != 'staff') return next(errorHandler(403, 'not staff stadium'));
    next();
}
