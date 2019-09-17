const router = require('express').Router()
const userController = require('./controllers/user-controller')
const auth = require('./middlewares/auth')

router.post('/login', userController.login)
router.post('/signup', userController.signup)
router.post('/refresh-token', userController.refreshToken)
router.post('/users/checkin', auth.authUser, userController.checkin)
router.post('/users/checkout', auth.authUser, userController.checkout)

router.patch('/users/checkModify', auth.authAdmin, userController.checkModify)

module.exports = router