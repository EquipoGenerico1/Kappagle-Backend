'use strict';

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./v2/config')
const version = require('./v2/routes');

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());

app.use(config.app.route_root, version);

module.exports = app;
