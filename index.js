var winston = require('winston');
var TaggedConsoleTarget = require('tagged-console-target');
var TaggedLogger = require('tagged-logger');
var moduleName = require('./module-name');

module.exports = function (config) {
  var winstonConfig = {};
  if (config) {
    // Currently no config format to understand.
  } else {
    // Default to console output if no config specified.
    winstonConfig = { transports: [ new TaggedConsoleTarget() ] };
  }

  var winstonLogger = new (winston.Logger)(winstonConfig);

  var log = new TaggedLogger(winstonLogger, []);

  var tag = moduleName(module);
  return log.createSublogger(tag);
};
