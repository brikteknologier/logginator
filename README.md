Installation
============

    npm install logginator

Usage
=====

    var log = require('logginator')(config);
    log.info("I am a log message");


Config
======

Optional. If left unspecified, logginator will default to console output.

To configure the backends, specify an array with the desired backend
configurations, for example:

    var log = require('logginator')([
      {
        "transport": "console"
      }, {
        "transport": "syslog"
      }
    ]);

console
-------

To output logs to the console, use this configuration:

    {
      "transport": "console"
    }

Console output has no configuration options.

syslog
------

To output logs to syslog, this configuration is sufficient:

    {
      "transport": "syslog"
    }

Additional options are:

 * `appname`: The name this process should use to identify itself to syslog. By
   default, logginator tries to deduce the name of the node project that uses
   logginator as a module.
 * `localhost`: The hostname of the current machine, as sent to syslog. Defaults
   to `os.hostname()`.
 * `facility`: The facility, in syslog terminology, that the logger should log
   to. This concept only makes sense in a syslog setting, so refer to syslog
   documentation if you want to make an informed choice. Otherwise, stick with
   the default value, which is `"local0"`.
 * `protocol`: The protocol via which to log. The default, and recommended,
   value, is `"unix"`, which makes logging go via Unix datagram sockets to the
   path specified in the `path` option. Other choices are `"tcp4"`, `"tcp6"`,
   `"udp4"` and `"udp6"`, which all require `host` and `port` to be specified.
 * `path`: The path to log to when using `"unix"` for `protocol`. If not set,
   logginator will try to deduce the default system log pipe by trying
   `/dev/log`, `/var/run/syslog` and `/var/run/log` in order. If all of these
   fail, logginator will raise an exception.
 * `host` and `port`: The host and port pair for the TCP or UDP log target if
   using any other protocol than `"unix"`. Note that the target syslog daemon
   must be configured to accept connections on the specified protocol.
