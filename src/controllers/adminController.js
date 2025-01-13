const bcryptjs = require('bcryptjs');
const { errorHandler } = require('../helpers/errorHandler');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');

class AdminController {
  constructor() {
    this.userService = UserService;
    this.authService = AuthService;
  }

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return next(errorHandler(401, "invalid email or password field"));

      const admin = await this.userService.findAdminByEmail(email);
      if (!admin) return next(errorHandler(403, "email not found"));
      if (!bcryptjs.compareSync(password, admin.password))
        return next(errorHandler(403, "password is invalid"));

      const userTokenData = {
        admin_id: admin.id,
        phone_number: admin.phone_number,
        email,
        full_name: admin.full_name,
      };
      const token = this.authService.signToken(userTokenData);

      res.cookie("jwt", token);
      console.log(userTokenData);
      res.status(200).json({
        data: {
          token,
          user: userTokenData,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logOut = (req, res, next) => {
    try {
      res.clearCookie("jwt");
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

}

module.exports = new AdminController();