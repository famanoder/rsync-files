#!/usr/bin/env node

import program from 'commander';
import pkg from '../../package.json';
// import {downloadDir, downloadFile} from '../lib/download';

program
.version(pkg.version)
.usage('<command> [options]')
.option('-v, --version', 'latest version');

// download --source --target

program
.command('download')
.alias('d')
.option('-s, --source <s>', 'source file or directory.')
.option('-d, --dest <d>', 'target file or directory.')
.option('-t, --type <t>', 'file or directory.')
.description('download files from remote server to local.')

.action(function({source, dest, type}) {
    console.log(source, dest);
});

program.parse(process.argv);
if (program.args.length < 1) program.help();