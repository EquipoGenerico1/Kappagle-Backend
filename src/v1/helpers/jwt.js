const JWT = require('jsonwebtoken')
const moment = require('moment')
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user-model')

function createToken(user) {
    let exp_token = moment().add(7, 'days').unix()
    return [
        JWT.sign({
            id: user.id,
            sub: user._id,
            role: user.role,
            iat: moment().unix(),
            exp: exp_token,
        }, process.env.SECRET_TOKEN),
        exp_token
    ]
}

function createRefreshToken(user) {
    return JWT.sign({
        id: user.id,
        sub: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(15, 'days').unix(),
    }, process.env.SECRET_REFRESH_TOKEN)
}

function refreshToken(req, res) {
    if (req.body.refresh_token && req.body.grant_type === 'refresh_token') {
        JWT.verify(req.body.refresh_token, process.env.SECRET_REFRESH_TOKEN, function (err, data) {
            if (err) {
                return res.status(400).send({
                    error: "TokenExpired"
                })
            }
            User.findOne({
                _id: data.sub,
            }, (err, user) => {
                if (err) {
                    return res.status(401).send({
                        error: "TokenExpired"
                    })
                }

                if (user) {
                    let dataToken = createToken(user)
                    res.status(200).send({
                        access_token: dataToken[0],
                        refresh_token: createRefreshToken(user),
                        expires_in: dataToken[1],
                        role: user.role
                    })
                } else {
                    return res.status(401).send({
                        error: "TokenExpired"
                    })
                }

            })
        })
    } else {
        return res.status(400).send({
            error: "BadRequest"
        })
    }
}

module.exports = {
    createToken,
    createRefreshToken,
    refreshToken
}