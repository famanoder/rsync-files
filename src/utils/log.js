import c from 'chalk';
import Events from 'events';

const events = new Events();
const verbose = JSON.parse(process.env.VERBOSE);
const {name: libName} = require('../../package.json');

function log() {
  console.log.apply(console, arguments);
}

log.error = function(msg) {
  log(c.gray('\n['+libName+'] ') + c.red(msg));
}

log.exit = function(msg) {
  log.error(msg) && process.exit(0);
}

log.info = function(cmd, msg='...') {
  log(c.cyanBright('['+libName+'] ') + (cmd?  c.greenBright(cmd + ': '): '') + (c.white(msg)));
}

log.CMDS = {
  INIT: 'init',
  SFTP: 'sftp',
  DONE: 'done',
  DOWNLOAD: 'download'
}

;['info', 'error', 'exit'].forEach(k => {
  events.on(k, function() {
    if(verbose) {
      log[k].apply(log, arguments);
    }
  });
});

export {
  log,
  events,
  verbose
}