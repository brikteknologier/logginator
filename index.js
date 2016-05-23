var fs = require('fs');
var os = require('os');
var winston = require('winston');
var winstonSyslog = require('winston-syslog').Syslog;
var winstonPapertrail = require('winston-papertrail').Papertrail;
var TaggedConsoleTarget = require('tagged-console-target');
var TaggedLogger = require('tagged-logger');
var moduleName = require('./module-name');
var util = require('util');
var _ = require('underscore');

// List of syslog levels, because the one present in winston is
// incorrect and makes logging fail.
var syslogLevels = {
  debug: 0,
  info: 1,
  notice: 2,
  warning: 3,
  warn: 3, // Keep warn for API compatibility
  error: 4,
  crit: 5,
  alert: 6,
  emerg: 7
};

// Monkey-patch winston-syslog to treat "warn" as "warning", to
// maintain API compatibility.
var originalSyslogLog = winstonSyslog.prototype.log;
winstonSyslog.prototype.log = function (level, msg, meta, callback) {
  if (level === "warn") level = "warning";
  return originalSyslogLog.call(this, level, msg, meta, callback);
};

var engines = {
  "console": function (spec) {
    return new TaggedConsoleTarget(spec);
  },

  "syslog": function (spec) {
    var options = {};

    var knownLogTargets = [
      "/dev/log", // Linux
      "/var/run/syslog", // OS X
      "/var/run/log" // BSD
    ];
    function isValidTarget(name) {
      return fs.existsSync(name) && fs.statSync(name).isSocket();
    }

    options.protocol = spec.protocol || "unix";
    if (options.protocol === "unix") {
      options.path = spec.path;
      if (!options.path) {
        for (var i = 0; i < knownLogTargets.length; ++i) {
          if (isValidTarget(knownLogTargets[i])) {
            options.path = knownLogTargets[i];
            break;
          }
        }
        if (!options.path) {
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
  },

  "papertrail": function(spec) {
    if (!spec.host || !spec.port) throw new Error("Host and port are required" + 
        "for papertrail log target");

    spec = _.extend({ program: process.title }, spec);

    var transport = new winstonPapertrail(spec);

    // Workaround due to bug in winston-papertrail
    // https://github.com/kenperkins/winston-papertrail/issues/40
    transport.exceptionsLevel = 'error';

    return transport;
  }
};

var defaultConfig = [ { "transport": "console" } ];

module.exports = function (identifiers, config) {
  if (typeof config == 'undefined') {
    config = identifiers;
    identifiers = [ moduleName(module) ];
  }

  if (typeof identifiers == 'string')
    identifiers = [ identifiers ];

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
  winstonLogger.setLevels(syslogLevels);

  var logger = new TaggedLogger(winstonLogger, identifiers);

  logger.info('created logger');
  logger.info('using the following transports:');

  config.forEach(function(transport, i) {
    logger.info(util.format('%d: [%s], with config %s',
        i + 1, transport.transport, JSON.stringify(transport)));
  });

  return logger;
};
