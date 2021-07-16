'use strict';

const service = require('./user-service');

module.exports = {
    checkIn,
    checkOut,
    checkModify,
    checkAll
}

async function checkIn(req, res) {
    try {

        let loggedUser = req.user;

        const result = await service.checkIn(loggedUser);
        return res.status(result.status).json(result.data);
    } catch (error) {
        return res.status(error.status).json(error.data)
    }
}

async function checkOut(req, res) {
    try {

        let loggedUser = req.user;
        const checkId = req.params.id;

        const result = await service.checkOut(loggedUser, checkId);
        return res.status(result.status).json(result.data);
    } catch (error) {
        return res.status(error.status).json(error.data)
    }
}

async function checkModify(req, res) {
    try {

        const params = req.params;
        const data_body = req.body;

        const result = await service.checkModify(params, data_body);
        return res.status(result.status).json(result.data);
    } catch (error) {
        return res.status(error.status).json(error.data)
    }
}

async function checkAll(req, res) {
    try {

        let loggedUser = req.user;
        
        const result = await service.checkAll(loggedUser);
        return res.status(result.status).json(result.data);
    } catch (error) {
        return res.status(error.status).json(error.data)
    }
}
