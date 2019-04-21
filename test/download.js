const {findOptions, events: evts} = require('../dist/utils');
const {default: download} = require('../dist/lib/download');

const {downloadFile, downloadDir} = download;

const remoteSource = '/home/others/test-ssh-upload/dist';
const testSftpOption = findOptions();

// downloadFile({
//   sftpOption: testSftpOption,
//   remoteFilepath: remoteSource,
//   localFilepath: 'abc.zip'
// }).then(res => console.log(res)).catch(e => {
//   evts.emit('exit', e.message);
// });

downloadDir({
  sftpOption: testSftpOption,
  remoteSource: remoteSource,
  localDir: 'a'
});