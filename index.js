var fs = require('fs');
var os = require('os');
var winston = require('winston');
var winstonSyslog = require('winston-syslog').Syslog;
var TaggedConsoleTarget = require('tagged-console-target');
var TaggedLogger = require('tagged-logger');
var moduleName = require('./module-name');

var engines = {
  "console": function () { return new TaggedConsoleTarget(); },

  "syslog": function (spec) {
    var options = {};

    var LINUX_LOG = "/dev/log", BSD_LOG = "/var/run/log";

    options.protocol = spec.protocol || "unix";
    if (options.protocol === "unix") {
      options.path = spec.path;
      if (!options.path) {
        if (fs.statSync(LINUX_LOG).isSocket()) options.path = LINUX_LOG;
        else if (fs.statSync(BSD_LOG).isSocket()) options.path = BSD_LOG;
        else {
          throw new Error("Failed to find log socket path, and no such " +
            "path was configured in \"path\" for the syslog logger backend");
        }
      }
    }
    // For TCP or UDP:
    options.host = spec.host;
    options.port = spec.port;

    options.app_name = spec.appname || moduleName(module);
    options.facility = spec.facility;
    options.localhost = spec.localhost || os.hostname();

    return new winstonSyslog(options);
  }
};

var defaultConfig = [ { "transport": "console" } ];

module.exports = function (config) {
  config = config || defaultConfig;
  if (!Array.isArray(config)) config = []; // Handle {} as no output

  var winstonConfig = {
    transports: []
  };

  config.forEach(function (spec) {
    if (engines.hasOwnProperty(spec.transport)) {
      winstonConfig.transports.push(engines[spec.transport](spec));
    }
  });

  var winstonLogger = new (winston.Logger)(winstonConfig);

  var log = new TaggedLogger(winstonLogger, []);

  var tag = moduleName(module);
  return log.createSublogger(tag);
};
