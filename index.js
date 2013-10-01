var fs = require('fs');
var winston = require('winston');
var winstonSyslog = require('winston-syslog').Syslog;
var TaggedConsoleTarget = require('tagged-console-target');
var TaggedLogger = require('tagged-logger');
var moduleName = require('./module-name');

var engines = {
  "console": function () { return new TaggedConsoleTarget(); },

  "syslog": function (spec) {
    var LINUX_LOG = "/dev/log", BSD_LOG = "/var/run/log";

    var protocol = spec.protocol || "unix", path;
    if (protocol === "unix") {
      path = spec.path;
      if (!path) {
        if (fs.statSync(LINUX_LOG).isSocket()) path = LINUX_LOG;
        else if (fs.statSync(BSD_LOG).isSocket()) path = BSD_LOG;
        else {
          throw new Error("Failed to find log socket path, and no such " +
            "path was configured in \"path\" for the syslog logger backend");
        }
      }
    }

    return new winstonSyslog({
      "protocol": protocol,
      "path": path
    });
  }
};

var defaultConfig = [ { "transport": "console" } ];

module.exports = function (config) {
  config = config || defaultConfig;

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
