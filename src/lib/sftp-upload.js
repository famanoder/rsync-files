require('events').EventEmitter.defaultMaxListeners = 0;

import Client from 'ssh2-sftp-client';
import {log, verbose, events as evts, normalizePath, spinner, calcText} from '../utils';

const sftp = new Client();
const sftpClient = require('./sftp').default(sftp);
const {CMDS} = log;

function sshUpload(target, assetsMap, folders = [], success, fail) {
	spinner.start('connectting...');
  sftpClient.connect()
	.then(() => {

    folders.unshift('');
		if(folders.length) {
			spinner.step(`init remote directories...`);

			const folderPromises = folders.map(folder => {
				return new Promise((rs, rj) => {
          const rfolder = normalizePath(target, folder);
					sftp.mkdir(rfolder).then(_ => rs(), _ => rs());
				});
      });
			
			Promise.all(folderPromises).then(res => {
				const uploadeds = [];
				const promises = assetsMap.map(item => {
					return new Promise((rs, rj) => {
						spinner.step(`uploading ${calcText(item.locPath)}`);
            sftp.fastPut(item.locPath, normalizePath(target, item.locPath), {encoding: 'utf8'})
						.then(() => {
							const uploaded = normalizePath(item.locPath);
							uploadeds.push(uploaded);
							rs(uploaded);
						})
						.catch(err => rj(err));
					});
				});
				return Promise.all(promises)
              .then(res => {
								
								if(uploadeds.length && verbose) {
									spinner.clear();
									uploadeds.forEach(item => {
										evts.emit('info', CMDS.DONE, 'uploaded: ' + calcText(item));
									});
									spinner.succeed(`all ${uploadeds.length} files uploaded.`);
								}
								
								success && success(res);
								sftp.end();
              })
              .catch(_ => {
								spinner.fail('upload failed.');
                evts.emit('error', CMDS.ERROR, _);
                fail && fail(_);
                sftp.end();
              });
			});
		}
	})
	
}

export default sshUpload;
