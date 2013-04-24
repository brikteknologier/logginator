var winston = require('winston');
var TaggedConsoleTarget = require('tagged-console-target');
var TaggedLogger = require('tagged-logger');

module.exports = function () {
  var winstonLogger = new (winston.Logger)({ transports: [ new TaggedConsoleTarget() ] });
  var log = new TaggedLogger(winstonLogger, []);

  return log;
};
