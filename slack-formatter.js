var loglevels = require('./loglevels');

function slackFormatter(level, msg, meta) {
  var levelValue = loglevels[level] || 0;

  var color = undefined;
  if (levelValue >= loglevels.error) color = "danger";
  else if (levelValue >= loglevels.warning) color = "warning";

  return {
    attachments: [
      {
        pretext: (meta.tags || []).join(', '),
        text: msg,
        color: color,
      }
    ]
  };
}

module.exports = slackFormatter;
