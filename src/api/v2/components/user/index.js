'use strict';

const router = require('express').Router();
const userController = require('./user-controller');
const auth = require('../../middlewares/auth');

router.get('/checks', auth.authUser, userController.checkAll);
router.post('/checks/checkin', auth.authUser, userController.checkIn);
router.patch('/checks/:id/checkout', auth.authUser, userController.checkOut);
router.patch('/:user/checks/:check', auth.authAdmin, userController.checkModify);

module.exports = router;