require('events').EventEmitter.defaultMaxListeners = 0;

import Client from 'ssh2-sftp-client';
import {log, c, normalizePath} from './utils';

function sshUpload(sshOptions, assetsMap, folders = [], success, fail) {
	const sftp = new Client();
  const { username, password, target, ip, port } = sshOptions;
  
	log.info(c.green('ready to connect to sftp.'));
  
  sftp.connect({
		host: ip,
		port,
		username,
		password
	})
	.then(() => {
		log.info(c.green(`connected to ${username}@${ip} successful !`));
    
    folders.unshift('');
		if(folders.length) {
      log.info(c.green('init remote directories ...'));

			const folderPromises = folders.map(folder => {
				return new Promise((rs, rj) => {
          const rfolder = normalizePath(target, folder);
					sftp.mkdir(rfolder).then(_ => rs(), _ => rs());
				});
      });
      
			Promise.all(folderPromises).then(res => {
				const promises = assetsMap.map(item => {
					return new Promise((rs, rj) => {
            // sftp.put(item.assetSource, normalizePath(target, item.locPath), {encoding: 'utf8'})
            sftp.fastPut(item.locPath, normalizePath(target, item.locPath), {encoding: 'utf8'})
						.then(() => {
              const uploaded = normalizePath(item.locPath);
              console.log('uploaded ', uploaded)
							rs(uploaded);
						})
						.catch(err => rj(err));
					});
				});
				return Promise.all(promises)
              .then(res => {
                log.info(`all ${assetsMap.length} files uploaded.`);
                success && success(res);
                sftp.end();
              })
              .catch(_ => {
                log.info(_);
                fail && fail(_);
                sftp.end();
              });
			});
		}
	})
	
}

export default sshUpload;
