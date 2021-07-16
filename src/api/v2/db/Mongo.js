const config = require('../config');

const mongoose = require('mongoose');

class Mongo {

    connect() {
        return new Promise((resolve, reject) => {
            mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true })
                .then((res) => { resolve(res); })
                .catch((error) => { reject(error); })
        });
    }

}
module.exports = new Mongo();