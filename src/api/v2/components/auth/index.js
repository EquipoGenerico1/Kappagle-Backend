'use strict';

const router = require('express').Router();
const userController = require('./auth-controller');
 
router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/refresh-token', userController.refreshToken);

module.exports = router;