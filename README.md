Installation
============

    npm install logginator

Usage
=====

    var log = require('logginator')(config);
    log.info("I am a log message");


Config
======

Optional.  If left empty, will default to console output.

If specified, is assumed to define where the output will go.  This is currently not
defined, so the only valid value is `{}`, which results in no output.
