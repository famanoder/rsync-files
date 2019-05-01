#!/usr/bin/env node

import program from 'commander';
import pkg from '../../package.json';
import * as download from '../lib/download';
import upload from '../lib/upload';
import {spinner, events, log, findOptions} from '../utils';

program
.version(pkg.version)
.usage('<command> [options]')
.option('-v, --version', 'latest version')
.option('-s, --source <s>', 'source file or directory.')
.option('-d, --dest <d>', 'target file or directory.')
.option('-t, --type <t>', 'file or directory.');

program
.command('upload')
.alias('u')
.description('upload files from local to remote server.')
.action(uploadAction);

program
.command('download')
.alias('d')
.description('download files from remote server to local.')
.action(downloadAction);

program.parse(process.argv);
if (program.args.length < 1) program.help();

function getParams() {
  const {source, dest, type = 'file'} = program;
  const option = findOptions();
  let _source = source;
  let _dest = dest;
  if(!source) {
    if(option && option.source) {
      _source = option.source;
    }
  }
  if(!dest) {
    if(option && option.target) {
      _dest = option.target;
    }
  }
  return {
    source: _source,
    target: _dest
  }
}

function uploadAction() {
  const {source, target} = getParams();
  upload({source, target});
}

function downloadAction() {
  const {source, target} = getParams();
  download[type === 'file'? 'downloadFile': 'downloadDir']({
    remoteSource: source,
    localTarget: target
  }).catch(e => {
    spinner.stop();
    events.emit('exit', log.CMDS.ERROR, e.message);
  });
}