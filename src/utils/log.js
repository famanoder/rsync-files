import c from 'chalk';
import Events from 'events';

const events = new Events();
const verbose = JSON.parse(process.env.VERBOSE || true);
const {name: libName} = require('../../package.json');

function log() {
  console.log.apply(console, arguments);
}

log.error = function(cmd, msg='...') {
  log(c.gray('\n['+libName+'] ') + (cmd? c.red(cmd + ': '): '') + msg);
}

log.exit = function(cmd, msg) {
  log.error(cmd, msg) && process.exit(0);
}

log.info = function(cmd, msg='...') {
  log(c.cyanBright('['+libName+'] ') + (cmd?  c.greenBright(cmd + ': '): '') + c.white(msg));
}

log.CMDS = {
  INIT: 'init',
  SFTP: 'sftp',
  DONE: 'done',
  DOWNLOAD: 'download',
  ERROR: 'error'
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