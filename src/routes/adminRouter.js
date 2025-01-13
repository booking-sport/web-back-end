const adminController = require('../controllers/adminController');
const router = require('express').Router();

router.post("/login", adminController.login);
module.exports = router;