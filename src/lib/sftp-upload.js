require('events').EventEmitter.defaultMaxListeners = 0;

import Client from 'ssh2-sftp-client';
import ora from 'ora';
import {log, verbose, events as evts, normalizePath} from '../utils';

let spinner;
const {CMDS} = log;

function sshUpload(sshOptions, assetsMap, folders = [], success, fail) {
	const sftp = new Client();
  const { username, password, target, host, port } = sshOptions;
  
  sftp.connect({
		host,
		port,
		username,
		password
	})
	.then(() => {

		evts.emit('info', CMDS.SFTP, `connect to ${username}@${host} successful !`);
    
    folders.unshift('');
		if(folders.length) {
			evts.emit('info', CMDS.SFTP, `init remote directories[${folders.slice(1)}]`);

			const folderPromises = folders.map(folder => {
				return new Promise((rs, rj) => {
          const rfolder = normalizePath(target, folder);
					sftp.mkdir(rfolder).then(_ => rs(), _ => rs());
				});
      });
			
			Promise.all(folderPromises).then(res => {
				if(verbose) {
					spinner = ora().start();
				}
				const uploadeds = [];
				const promises = assetsMap.map(item => {
					return new Promise((rs, rj) => {
						if(spinner) spinner.text = `uploading ${item.locPath}`;
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
										log.info(CMDS.DONE, 'uploaded: ' + item);
									});
									spinner.succeed(`all ${uploadeds.length} files uploaded.`);
								}
								
								success && success(res);
								sftp.end();
              })
              .catch(_ => {
								spinner && spinner.clear().fail('upload failed.');
                log.error(_.message);
                fail && fail(_);
                sftp.end();
              });
			});
		}
	})
	
}

export default sshUpload;
