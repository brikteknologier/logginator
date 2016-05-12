// We use syslog loglevels, because the ones in winston make logging fail

module.exports = {
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
