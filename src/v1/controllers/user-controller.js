//Imports
const moment = require('moment')
const uniqid = require('uniqid')
const user = require('../models/user-model')
const authJWT = require('../helpers/jwt')

/**
 * POST     /api/login              -> login
 * POST     /api/signup             -> signup
 * POST     /api/refresh-token      -> refreshToken
 * POST     /api/users/:id/checkin  -> users/:id/checkin
 * POST     /api/users/:id/checkout -> users/:id/checkout
 */

module.exports = {
    login,
    signup,
    refreshToken,
    checkin,
    checkout,
    checkModify,
    checkAll
}

/**
 * Authenticates a user and returns JWT
 * @param {request} req Request
 * @param {*} res Response
 */
function login(req, res) {
    if (req.body.password && req.body.email) {
        user.findOne({
            email: req.body.email
        })
            .select("_id password")
            .exec((err, userResult) => {
                if (err || !userResult) {
                    return res.status(401).send({ error: "User does not exist" });
                }

                userResult.comparePassword(req.body.password, userResult.password, function (err, isMatch) {
                    if (isMatch & !err) {

                        let dataToken = authJWT.createToken(userResult);
                        return res.status(200).send({
                            access_token: dataToken[0],
                            refresh_token: authJWT.createRefreshToken(userResult),
                            expires_in: dataToken[1],
                            role: userResult.role
                        });

                    } else {
                        return res.status(401).send({ error: "Password or Email Invalid" });
                    }
                });

            });
    } else {
        return res.status(401).send({ error: "BadRequest" });
    }
}

/**
 * Creates a user and returns a JWT
 * @param {request} req Request
 * @param {*} res Response
 */
function signup(req, res) {
    // Save new user
    user.create(req.body)
        .then(user => {
            console.log(user);
            let dataToken = authJWT.createToken(user);
            let userResponse = {
                access_token: dataToken[0],
                refresh_token: authJWT.createRefreshToken(user),
                expires_in: dataToken[1],
                role: user.role
            };
            return res.status(200).send(userResponse);

        })
        .catch(err => {
            console.log(err);
            return res.status(400).send(err);
        });
}

/**
 * Refreshes access_token
 * @param {request} req Request
 * @param {*} res Response
 */
function refreshToken(req, res) {
    authJWT.refreshToken(req, res);
}

function checkin(req, res) {
    // Save new check

    const timeStamp = moment().toObject();
    const id = uniqid();

    let check = {
        date: timeStamp.date + '/' + timeStamp.months + '/' + timeStamp.years,
        checkIn: timeStamp.hours + ':' + timeStamp.minutes,
        checkOut: '',
        _id: id
    }

    user.findByIdAndUpdate(req.params.id, { $push: { checks: check } }, { new: true })
    .then(user => {
        return res.status(201).json({ check })
    })
    .catch(err=>{
        return res.status(404).json({ message: 'Users was not found', error: err })
    })

}

function checkout(req, res) {

    const timeStamp = moment().toObject();
    let checkOut = timeStamp.hours + ':' + timeStamp.minutes;

    user.findOneAndUpdate({ _id: req.params.id, "checks._id": req.body.checkId }, { $set: {"checks.$.checkOut": checkOut }}, { new: true })
    .then(resultUser => {

        let resultCheck = resultUser.checks.find(check => check._id == req.body.checkId )

        return res.json(resultCheck)

    })
    .catch(err=>{
        return res.status(404).json({ message: 'Users was not found', error: err })
    })

}

function checkModify(req, res) {

    user.findOneAndUpdate({ _id: req.body.userId , "checks._id": req.body.checkId }, 
    { 
        $set: {
        "checks.$.checkIn": req.body.checkIn, 
        "checks.$.checkOut": req.body.checkOut 
        }
    }, 
    {
        new: true 
    })
    .then(resultUser => {

        let resultCheck = resultUser.checks.find(check => check._id == req.body.checkId )

        return res.json(resultCheck)

    })
    .catch(err=>{
        return res.status(404).json({ message: 'Users was not found', error: err })
    })

}

function checkAll(req, res) {

    user.findById(req.params.id)
    .then(resultUser => {

        return res.json(resultUser.checks.reverse())

    })
    .catch(err=>{
        return res.status(404).json({ message: 'Users was not found', error: err })
    })

}