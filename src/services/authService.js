
const jwt = require('jsonwebtoken');

class AuthService {
    constructor() {}

    signToken(userData) {
        return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRETE, {expiresIn: '30m'});
    }
    
}

module.exports  = new AuthService();