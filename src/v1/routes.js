const router = require('express').Router()
const userController = require('./controllers/user-controller')
const auth = require('./middlewares/auth')

router.post('/login', userController.login)
router.post('/signup', userController.signup)
router.post('/refresh-token', userController.refreshToken)

router.get('/users/checks/current-check', auth.authUser, userController.currentCheck)
router.get('/users/checks', auth.authUser, userController.checkAll)
router.post('/users/checks/checkin', auth.authUser, userController.checkIn)
router.patch('/users/checks/checkout', auth.authUser, userController.checkOut)
router.patch('/users/:user/checks/:check', auth.authAdmin, userController.checkModify)

router.get('/users/worked-hours', auth.authUser, userController.getWorkedHoursUser)
router.get('/users/:id/worked-hours', auth.authAdmin, userController.getWorkedHoursAdmin)
router.get('/users/:id', auth.authAdmin, userController.getUser)
router.get('/users', auth.authAdmin, userController.userAll)

module.exports = router