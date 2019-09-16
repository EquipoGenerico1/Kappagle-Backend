const router = require('express').Router()
const userController = require('./controllers/user-controller')

router.post('/login', userController.login)
router.post('/signup', userController.signup)
router.post('/refresh-token', userController.refreshToken)

router.post('/users/:id/checkin', userController.checkin)

module.exports = router