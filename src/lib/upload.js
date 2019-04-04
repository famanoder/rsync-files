import sftpUpload from './sftp-upload';
import {log, getAgrType, makeAssetsMap} from './utils';

function sshUpload({
  sftpOption: s,
  source, 
  ignoreRegexp,
  success,
  fail
}) {
  
  if(getAgrType(s) !== 'object') {
    log.exit('sftpOption must be provided !');
  }

  let {
    username, 
    password, 
    target, 
    ip,
    port = 22
  } = s;

  if([username, password, target, ip].some(k => !k)) {
    log.exit('some sftpOption must be provided !');
  }

  makeAssetsMap(source, ignoreRegexp)
  .then(({assets, folders}) => {
    sftpUpload({
      ip,
      port,
      username,
      password,
      target
    }, assets, folders, success, fail);
  }).catch(e => log.error(e));
  
}
// const sshUpload = require('@nutui/client-upload');

sshUpload({
  source: ['dist', 'yarn.lock'],
  ignoreRegexp: /node_modules/,
  success: function() {
    console.log('all uploaded......');
  },
  sftpOption: {
    ip: '132.232.60.18',
    port: 22,
    username: 'root',
    password: '!Famanoder1',
    target: '/home/others/test-ssh-upload'
  }
});

export default sshUpload;