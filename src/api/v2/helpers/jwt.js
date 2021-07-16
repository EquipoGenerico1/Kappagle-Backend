'use strict';

const jwt = require('jsonwebtoken');
const moment = require('moment');

const config = require('../config');
const USER = require('../components/user/user-model')

module.exports = {
    createToken,
    userToken,
    createRefreshToken,
    refreshToken
}

function createToken(user) {

    let exp_token = moment().add(7, 'days').unix()

    let token = jwt.sign({
        id: user.id,
        sub: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: exp_token,
    }, config.jwt.secret_token);

    return {
        token: token,
        expire: exp_token
    }
}

function userToken(user) {

    let dataToken = createToken(user)
    let data = {
        access_token: dataToken.token,
        refresh_token: createRefreshToken(user),
        expires_in: dataToken.expire,
        role: user.role
    };
    return data;
}

function createRefreshToken(user) {
    return jwt.sign({
        id: user.id,
        sub: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(15, 'days').unix(),
    }, config.jwt.secret_refresh_token)
}

function refreshToken(refresh_token, grant_type) {

    return new Promise((resolve, reject) => {

        if (refresh_token && grant_type === 'refresh_token') {

            jwt.verify(refresh_token, config.jwt.secret_refresh_token, async function (err, data) {

                if (err) {
                    reject({
                        status: 401, data: {
                            error: err
                        }
                    })
                }

                const user = await USER.findById(data.sub);

                if (user) {

                    let data = userToken(user)
                    resolve({ status: 200, data: data })
                }

                reject({
                    status: 401, data: {
                        error: "TokenExpired"
                    }
                })

            })
        }

        reject({
            status: 400, data: {
                error: "BadRequest"
            }
        })

    });
}
