'use strict';

//Imports
const service = require('./auth-service');

/**
 * POST     /api/login              -> login
 * POST     /api/signup             -> signup
 * POST     /api/refresh-token      -> refreshToken
 */

module.exports = {
    login,
    signup,
    refreshToken
}

async function login(req, res) {
    try {

        const { email, password } = req.body;
        const result = await service.login(email, password);
        return res.status(result.status).json(result.data);

    } catch (error) {
        return res.status(error.status).json(error.data);
    }
}

async function signup(req, res) {
    try {

        const data = req.body;
        const result = await service.signup(data);
        return res.status(result.status).json(result.data);

    } catch (error) {
        return res.status(error.status).json(error.data);
    }
}

async function refreshToken(req, res) {
    try {
        const { refresh_token, grant_type } = req.body;

        const result = await service.refreshToken(refresh_token, grant_type);
        return res.status(result.status).json(result.data);

    } catch (error) {
        return res.status(error.status).json(error.data);
    }
}