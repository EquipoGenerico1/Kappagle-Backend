const router = require('express').Router()
const userController = require('./controllers/user-controller')
const auth = require('./middlewares/auth')
const multer = require('./helpers/multer');

router.post('/login', userController.login)
router.post('/signup', userController.signup)
router.post('/refresh-token', userController.refreshToken)

router.get('/users/checks/current-check', auth.authUser, userController.currentCheck)
router.get('/users/checks', auth.authUser, userController.checkAll)
router.get('/users/:id/checks', auth.authAdmin, userController.checkAllFromId)
router.post('/users/checks/checkin', auth.authUser, userController.checkIn)
router.patch('/users/checks/checkout', auth.authUser, userController.checkOut)
router.patch('/users/:user/checks/:check', auth.authAdmin, userController.checkModify)

router.get('/users/:id/pdf', auth.authAdmin, userController.getPdfAdmin)
router.get('/users/pdf', auth.authUser, userController.getPdfUser)

router.get('/users/worked-hours', auth.authUser, userController.getWorkedHoursUser)
router.get('/users/:id/worked-hours', auth.authAdmin, userController.getWorkedHoursAdmin)

router.post('/users/photo', auth.authUser, multer.single('avatar'), userController.savePhotoProfile)

router.patch('/users/edit', auth.authUser, userController.updateMyProfile)
router.get('/users/profile', auth.authUser, userController.getMyProfile)
router.get('/users/:id', auth.authAdmin, userController.getUser)
router.get('/users', auth.authAdmin, userController.userAll)

module.exports = router