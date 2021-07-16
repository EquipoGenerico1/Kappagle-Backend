'use strict';

const app = require('./api/app');
const config = require('./api/v2/config');
const Mongo = require('./api/v2/db/Mongo');

Mongo.connect().then(() => {
    try {
        app.listen(config.app.port);
        console.log(`🔥 STARTING SERVER AT 🔥\n ${config.app.url}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}).catch((error) => {
    console.log(error);
    process.exit(1);
});