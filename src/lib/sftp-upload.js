require('events').EventEmitter.defaultMaxListeners = 0;

import Client from 'ssh2-sftp-client';
import {log, events as evts, normalizePath, spinner, findOptions} from '../utils';

const option = findOptions();
const CONCURRENCY_NUM = option.uploadConcurrencyNumber || 6000;
const sftp = new Client();
const promisesAll = Promise.all.bind(Promise);
const sftpClient = require('./sftp').default(sftp);
const {CMDS} = log;

let uploadedNum = 0;


function makeFolders(target, folders) {
	return folders.map(folder => {
		return new Promise((rs, rj) => {
			const rfolder = normalizePath(target, folder);
			sftp.mkdir(rfolder).then(_ => rs(), _ => rs());
		});
	});
}

function concurrencyNumWarn(assetsMap) {
	if(assetsMap.length > CONCURRENCY_NUM) {
		evts.emit('warn', CMDS.WARN, `${assetsMap.length} files has splited to ${Math.ceil(assetsMap.length / CONCURRENCY_NUM)} blocks, and concurrency num is ${CONCURRENCY_NUM}.`);
	}
}

function makeOncePromises(currProgress, target, subAssets) {
	spinner.step(`[${currProgress}] uploaded 0%`);
	return subAssets.map(item => {
		return sftp.fastPut(item.locPath, normalizePath(target, item.locPath), {encoding: 'utf8'})
						.then(() => {
							uploadedNum ++;
							spinner.step(`[${currProgress}] uploaded ${Math.round(uploadedNum / subAssets.length * 100)}%`);
							const uploaded = normalizePath(item.locPath);
							return Promise.resolve(uploaded);
						});
	});
}

function recurrenceAssets(procNum, target, assetsMap) {
	return new Promise((rs, rj) => {
		let curr = 1;
		let uploaded = [];
		function _once(assets) {
			const currProgress = `${curr}/${procNum}`;
			promisesAll(makeOncePromises(`${currProgress}`, target, assets)).then(res => {
				uploadedNum = 0;
				
				uploaded = [...uploaded, ...res];
				const rest = assetsMap.length - (curr) * CONCURRENCY_NUM;
				
				if(rest > 0) {
					curr ++;
					const start = (curr - 1) * CONCURRENCY_NUM;
					_once(assetsMap.slice(start, start + Math.min(CONCURRENCY_NUM, rest)));
				}else{
					rs(uploaded);
					spinner.stop();
				}
			}).catch(_ => rj(_));
			
		}
		_once(assetsMap.slice(0, CONCURRENCY_NUM));
	});
	
}

function sshUpload(target, assetsMap, folders = [], success, fail) {
	concurrencyNumWarn(assetsMap);

	spinner.start('connecting...');
  sftpClient.connect()
	.then(() => {
    folders.unshift('');
		if(folders.length) {
			spinner.step(`init remote directories...`);

			const folderPromises = makeFolders(target, folders);
			const procNum = Math.ceil(assetsMap.length / CONCURRENCY_NUM);
			promisesAll(folderPromises).then(() => {
				recurrenceAssets(procNum, target, assetsMap)
				.then(res => {
					if(res.length) {
						evts.emit('info', CMDS.DONE, `all ${res.length} files uploaded.`);
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
