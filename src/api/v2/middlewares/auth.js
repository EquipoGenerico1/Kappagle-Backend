'use strict';

const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');

const config = require('../config');
const USER = require('../components/user/user-model');

/**
 * USER
 * Access for role: ROLE_USER
 */
passport.use('user', new Strategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret_token,
}, async (payload, done) => {
    try {

        const user = await USER.findById(payload.sub).select('_id');

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        done(error, false);
    }
}))

const authUser = passport.authenticate('user', {
    session: false
})

/**
 * ADMIN
 * Access for role: ROLE_ADMIN
 */
passport.use('admin', new Strategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret_token,
}, async (payload, done) => {
    try {

        const user = await USER.findOne({ _id: payload.sub, role: 'ROLE_ADMIN' }).select('_id');

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        done(error, false);
    }
}))

const authAdmin = passport.authenticate('admin', {
    session: false
})

module.exports = {
    authUser,
    authAdmin,
}