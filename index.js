var fs = require('fs');
var path = require('path');
var winston = require('winston');
var TaggedConsoleTarget = require('tagged-console-target');
var TaggedLogger = require('tagged-logger');

function moduleName() {
  function moduleId() {
    if (module && module.parent && module.parent.id) {
      var id = module.parent.id;
      var moduleFile = path.basename(id);
      var nameMatch = /(.*)\.js$/.exec(moduleFile);
      if (nameMatch && nameMatch[1])
        return nameMatch[1];
    }
  }
  function packageDef() {
    var ppath = path.dirname(module.parent.filename);
    while (ppath) {
      var packFile = path.join(ppath, "package.json");
      if (fs.existsSync(packFile)) {
        try {
          var packageConfig = JSON.parse(fs.readFileSync(packFile));
          return packageConfig.name;
        } catch(_) { /* ignore */ }
      }
      ppath = path.dirname(ppath);
    }
  }
  function filename() {
    return path.basename(module.parent.filename);
  }
  return moduleId() || packageDef() || filename() || "main";
}

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

  var tag = moduleName();
  return log.createSublogger(tag);
};
