'use strict';

var express = require('express');

var environment = 'development';    // process.env.NODE_ENV || 'development';
var DEFAULT_PORT = 3000;


/**
 * Given a folder-map from the configuration file, this method applies the content
 * to the supplied express application.
 * @param app Instance of the express application the folder map will be applied to.
 * @param folderMap The folder map to be applied.
 * @param appRoot Root folder of the application.
 */
function applyFolderMap(app, folderMap, appRoot) {
    if ( folderMap ) {
        folderMap.forEach( e => app.use( e.url, express.static( appRoot + e.path )));
    }
}


/**
 * Given a file-map from the configuration file, this method adds a handler that
 * sends a specified file in response to the queried url.
 * @param app
 * @param fileMap
 * @param appRoot
 */
function applyFileMap(app, fileMap, appRoot) {
    if ( fileMap ) {
        fileMap.forEach( e => app.get( e.url, function( req, res ) {
                                                        res.sendFile( e.path );
                                                    }
                        ));
    }
}


/**
 * Loads the specified configuration file and applies it to the express application.
 * @param app Instance of the express application the config is to be applied to.
 * @param path File location of the configuration to be applied.
 *             Note: This file location is relative to the appRoot path also supplied.
 * @param appRoot Root folder of the application.
 */
module.exports.load = function(app, path, appRoot) {
    if ( !app ) {
        throw 'Cannot load configuration without an application object.';
    }

    if ( !path ) {
        throw 'Cannot load configuration without a path.';
    }

    if ( !appRoot ) {
        throw 'Cannot load configuration without an application root.';
    }

    var config = require(appRoot + '/' + path);

    if ( !config ) {
        throw 'Could not find config file \'' + path + '\'.';
    }

    if (config[environment]) {
        module.exports.port = config[environment].port || DEFAULT_PORT;

        applyFolderMap( app, config[environment].folderMap, appRoot );
        applyFileMap( app, config[environment].fileMap, appRoot );
    } else {
        console.log('Unable to find configuration for environment \'' + environment + '\'.');
    }
};

module.exports.port = DEFAULT_PORT;
module.exports.environment = environment;
