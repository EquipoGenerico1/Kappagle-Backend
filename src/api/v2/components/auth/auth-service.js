'use strict';

//Imports
const jwt = require('../../helpers/jwt');
const USER = require('../user/user-model');

/**
 * POST     /api/v2/auth/login              ->  login
 * POST     /api/v2/auth/signup             ->  signup
 * POST     /api/v2/auth//refresh-token     ->  refreshToken
 */

module.exports = {
    login,
    signup,
    refreshToken
}


/**
 * Authenticates a user and returns JWT
 * @param {request} req Request
 * @param {*} res Response
 */
function login(email, password) {
    return new Promise((resolve, reject) => {

        USER.findOne({ email: email }).select('password role').then((userResult) => {

            userResult.comparePassword(password, userResult.password).then(() => {

                let userResponse = jwt.userToken(userResult);

                resolve({ status: 200, data: userResponse });

            }).catch((err) => {
                reject({ status: 401, data: { error: "Password or Email Invalid" } });
            });

        }).catch((error) => {
            reject({ status: 401, data: { error: "Password or Email Invalid" } });
        });
    });
}

/**
 * Creates a user and returns a JWT
 * @param {request} req Request
 * @param {*} res Response
 */
function signup(data) {
    return new Promise((resolve, reject) => {

        const new_user = new USER(data);

        new_user.save().then((user) => {

            let userResponse = jwt.userToken(user);

            resolve({ status: 201, data: userResponse });
        }).catch((err) => {
            reject({ status: 400, data: userReserrponse });
        });
    });
}

/**
 * Refreshes access_token
 * @param {request} req Request
 * @param {*} res Response
 */
function refreshToken(refresh_token, grant_type) {
    return new Promise((resolve, reject) => {
        jwt.refreshToken(refresh_token, grant_type).then((res) => {
            resolve(res);
        }).catch((error) => {
            reject(error);
        });
    });
}