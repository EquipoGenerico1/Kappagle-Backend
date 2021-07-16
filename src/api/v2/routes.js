'use strict';

const router = require('express').Router();

const user = require('./components/user');
const auth = require('./components/auth');

router.use('/users', user);
router.use('/auth', auth);

module.exports = router;