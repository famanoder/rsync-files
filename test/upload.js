const {default: sshUpload} = require('../dist/lib/upload');
const {log, findOptions} = require('../dist/utils');

if(findOptions()) {
  sshUpload({
    source: ['dist', 'yarn.lock', 'node_modules.zip'],
    success: function() {
      console.log('all uploaded......');
    },
    sftpOption: findOptions()
  });
}else{
  log.exit('no config found.');
}