const {findOptions, events: evts} = require('../dist/utils');
const {default: download} = require('../dist/lib/download');

const {downloadFile} = download;

const remoteSource = '/home/others/test-ssh-upload/yarn.lock';
const testSftpOption = findOptions();

downloadFile({
  sftpOption: testSftpOption,
  remoteFilepath: remoteSource,
  localFilepath: 'abc'
}).then(res => console.log(res)).catch(e => {
  evts.emit('exit', e.message);
});
