/*
 * Tries to guesstimate the name of the module using logginator.
 * Intended to be used in the cases where application name is not given.
 */

var fs = require('fs');
var path = require('path');

function moduleId(logginatorModule) {
  if (logginatorModule && logginatorModule.parent && logginatorModule.parent.id) {
    var id = logginatorModule.parent.id;
    var moduleFile = path.basename(id);
    var nameMatch = /(.*)\.js$/.exec(moduleFile);
    if (nameMatch && nameMatch[1])
      return nameMatch[1];
  }
}

function packageDef(logginatorModule) {
  var ppath = path.dirname(logginatorModule.parent.filename);
  while (ppath && ppath !== '/') {
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

function filename(logginatorModule) {
  return path.basename(logginatorModule.parent.filename);
}

module.exports = function (logginatorModule) {
  return moduleId(logginatorModule) ||
    packageDef(logginatorModule) ||
    filename(logginatorModule) ||
    "main";
};
