'use strict';

var express = require('express');
var config = require('./server/config');

var app = express();

config.load(app, 'server_config.json', __dirname);

// If the PORT environment variable is set, that takes priority over the configuration.
var port = process.env.PORT || config.port;

var server = app.listen(port, function() {
    console.log('Server using environment \'' + config.environment + '\' listening on port ' + port + '.');
});
