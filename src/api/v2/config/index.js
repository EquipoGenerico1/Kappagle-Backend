'use strict';

const dotenv = require('dotenv');
dotenv.config();

/**
 * Configuración de app
 */
const port = process.env.PORT;
const version = process.env.VERSION;
const route_root = '/api/' + version + '/';

module.exports = {
    app: {
        mode: process.env.NODE_ENV,
        port: port,
        version: version,
        route_root: route_root,
        url: process.env.BASE_URL + ':' + port + route_root
    },
    db: {
        uri: process.env.MONGODB_URI
    },
    jwt: {
        secret_token: process.env.SECRET_TOKEN,
        secret_refresh_token: process.env.SECRET_REFRESH_TOKEN
    }
};