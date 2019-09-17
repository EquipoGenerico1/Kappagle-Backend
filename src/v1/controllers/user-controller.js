//Imports
const moment = require('moment')
const user = require('../models/user-model')
const authJWT = require('../helpers/jwt')

/**
 * POST     /api/login              -> login
 * POST     /api/signup             -> signup
 * POST     /api/refresh-token      -> refreshToken
 */

module.exports = {
    login,
    signup,
    refreshToken,
    checkin
}

const _UPDATE_DEFAULT_CONFIG = {
    new: true,
    runValidators: true
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

    let timeStamp = moment().toObject();

    let check = {
        date: timeStamp.date + '/' + timeStamp.months + '/' + timeStamp.years,
        checkIn: timeStamp.hours + ':' + timeStamp.minutes,
        checkOut: ''
    }

    user.findByIdAndUpdate({ _id: req.params.id }, { $push: { checks: check } }, { new: true })
    .then(user => {
        return res.status(201).json({ check: user.checks[user.checks.length - 1], arrayIndex: user.checks.indexOf(user.checks[user.checks.length - 1]) })
    })
    .catch(err=>{
        return res.status(404).json({ message: 'El usuario no fue encontrado', error: err })
    })

}