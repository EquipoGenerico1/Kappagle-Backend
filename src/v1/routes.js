const router = require('express').Router()
const userController = require('./controllers/user-controller')
const auth = require('./middlewares/auth')

router.post('/login', userController.login)
router.post('/signup', userController.signup)
router.post('/refresh-token', userController.refreshToken)

router.get('/users/:id/checkAll', userController.checkAll)

router.post('/users/:id/checkin', userController.checkin)
router.post('/users/:id/checkout', userController.checkout)

router.patch('/users/checkModify', auth.authAdmin, userController.checkModify)

module.exports = router