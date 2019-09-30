'use strict';

const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const routerv1 = require('./src/v1/routes');
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use('/api/v1', routerv1);

mongoose.connect(process.env.MONGODB_URI + "/kappagle", { useNewUrlParser: true }).then(res => {
    app.listen(process.env.PORT || 5000);
    console.log(`STARTING SERVER AT: localhost:${process.env.PORT || 5000}`);
}).catch(err => {
    console.log(err);
})

