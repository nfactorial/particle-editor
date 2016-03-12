'use strict';

var chai = require('chai');
var expect = chai.expect;
var config = require('./../../../server/config');

/**
 * Simple mock to count the number of times the use and get methods are invoked.
 */
class ExpressMock {
    constructor() {
        this.useCount = 0;
        this.getCount = 0;
    }

    get(url, callback) {
        this.getCount++;
    }

    use(url, callback) {
        this.useCount++;
    }
}


/**
 * Unit test to verify the behaviour of the configuration loading module.
 * /server/config/index.js
 */
describe('server/config', function() {
    var devEnvironment = 'development';
    var emptyConfig = 'empty_config.json';
    var fullConfig = 'test_config.json';
    var fileMapConfig = 'file_map_config.json';
    var folderMapConfig = 'folder_map_config.json';
    var invalidPath = 'no_such_file';
    var appRoot = __dirname;

    it('Should be in the correct environment.', function() {
        // expect(config.environment).to.equal(process.env.NODE_ENV || devEnvironment);
        expect(config.environment).to.equal(devEnvironment)
    });

    it('Should have default port set to 3000.', function() {
        expect(config.port).to.equal(3000);
    });

    it('Should throw an exception if no app is supplied.', function() {
        expect(config.load.bind(undefined, emptyConfig, appRoot)).to.throw()
    });

    it('Should throw an exception if no filename is supplied.', function() {
        var testApp = {};
        expect(config.load.bind(testApp, undefined, appRoot)).to.throw()
    });

    it('Should throw an exception if no application root is supplied.', function() {
        var testApp = {};
        expect(config.load.bind(testApp, emptyConfig, undefined)).to.throw()
    });

    it('Should throw an exception if the file cannot be found.', function() {
        var testApp = {};
        expect(config.load.bind(testApp, invalidPath, appRoot)).to.throw()
    });

    it('Should not invoke any methods with an empty configuration.', function() {
        var testApp = new ExpressMock();

        config.load(testApp, emptyConfig, appRoot);

        expect(testApp.getCount).to.equal(0);
        expect(testApp.useCount).to.equal(0);
    });

    it('Should invoke get once for each entry in the file map.', function() {
        var testApp = new ExpressMock();

        config.load(testApp, fileMapConfig, appRoot);

        expect(testApp.getCount).to.equal(1);
        expect(testApp.useCount).to.equal(0);
    });

    it('Should invoke use once for each entry in the folder map.', function() {
        var testApp = new ExpressMock();

        config.load(testApp, folderMapConfig, appRoot);

        expect(testApp.getCount).to.equal(0);
        expect(testApp.useCount).to.equal(1);
    });

    it('Should invoke correct methods for multiple file and folder entries.', function() {
        var testApp = new ExpressMock();

        config.load(testApp, fullConfig, appRoot);

        expect(testApp.getCount).to.equal(2);
        expect(testApp.useCount).to.equal(3);
    });

    it('Should correctly extract the configurations port setting.', function() {
        var testApp = new ExpressMock();

        config.load(testApp, fullConfig, appRoot);

        expect(config.port).to.equal(9000);
    });
});
