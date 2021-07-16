'use strict';

//Imports
const moment = require('moment');
const USER = require('./user-model');

/**
 * GET      /api/v2/users/checks                ->  checkAll 
 * POST     /api/v2/users/checks/checkin        ->  checkIn      
 * PATCH    /api/v2/users/checks/:id/checkout   ->  checkOut 
 * PATCH    /api/v2/users/:user/checks/:check   ->  checkModify
 */

module.exports = {
    checkIn,
    checkOut,
    checkModify,
    checkAll
}

/**
 * Make a new check-in
 * @param {request} req Request
 * @param {*} res Response
 */
function checkIn(loggedUser) {
    return new Promise((resolve, reject) => {

        const timeStamp = moment().utc().toObject();

        let check = {
            date: timeStamp.date + '/' + timeStamp.months + '/' + timeStamp.years,
            checkIn: timeStamp.hours + ':' + timeStamp.minutes
        }

        USER.findByIdAndUpdate(loggedUser._id,
            { $push: { checks: check } },
            { new: true })
            .then((user) => {

                resolve({ status: 201, data: user.checks });
            })
            .catch(err => {
                reject({ status: 404, data: { message: 'Users was not found', error: err } });
            })
    });
}

function checkOut(loggedUser, checkId) {
    return new Promise((resolve, reject) => {

        const timeStamp = moment().utc().toObject();
        const checkOut = timeStamp.hours + ':' + timeStamp.minutes;

        USER.findOneAndUpdate(
            {
                _id: loggedUser._id,
                "checks._id": checkId,
                'checks.checkOut': ''
            },
            { $set: { "checks.$.checkOut": checkOut } },
            { new: true })
            .then((resultUser) => {

                let resultCheck = resultUser.checks.find(check => check._id == checkId);
                resolve({ status: 200, data: resultCheck });
            })
            .catch((err) => {
                reject({ status: 404, data: { message: 'Users was not found', error: err } });
            })
    });
}

function checkModify(params, data_body) {
    return new Promise((resolve, reject) => {

        const { user, check } = params;
        const { checkId, checkIn, checkOut } = data_body;

        USER.findOneAndUpdate(
            { _id: user, "checks._id": check },
            {
                $set: {
                    "checks.$.checkIn": checkIn,
                    "checks.$.checkOut": checkOut
                }
            },
            { new: true })
            .then(resultUser => {

                let resultCheck = resultUser.checks.find(check => check._id == checkId);
                resolve({ status: 200, data: resultCheck });
            })
            .catch(err => {
                reject({ status: 404, data: { message: 'Users was not found', error: err } });
            })
    });
}

function checkAll(loggedUser) {
    return new Promise((resolve, reject) => {

        USER.findById(loggedUser._id).then((resultUser) => {

            resolve({ status: 200, data: resultUser.checks.reverse() })
        }).catch((err) => {
            reject({ status: 404, data: { message: 'Users was not found', error: err } })
        });
    });
}
