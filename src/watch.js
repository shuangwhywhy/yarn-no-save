#!/usr/bin/env node

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import Single from 'single-instance';
import { userInfo } from 'os';
import { makeJs } from './make.js';

const { uid, gid } = userInfo();
const cwd = process.cwd();
const whereIsYarn = exec('readlink', '-f', '`which yarn`');
const yarnCliFile = path.resolve(whereIsYarn, '../../lib/cli.js');

function exec (cmd, ...args) {
	const PATH = process.env?.PATH?.split(':')?.filter(p => !/^\/var\/folders\//.test(p))?.join(':');
	const { stdout, stderr } = spawnSync(cmd, args, {	// ignore_security_alert
		cwd, uid, gid, shell: process.env.SHELL, env: {
			...process.env,
			PATH
		}
	});
	const errStr = stderr.toString().replace(/\n+$/, '');
	if (errStr) {
		console.error(errStr);
	}
	return stdout.toString().replace(/\n+$/, '');
}

function detect() {
	const result = exec('grep', '-e', '"--no-save"', yarnCliFile);
	return !!result.trim();
}

new Single('yarn-cli-watcher')
.lock()
.then(function watch() {
	const watcher = fs.watch(yarnCliFile, {
		persistent: true
	}, (event) => {
		if (event === 'rename') {
			watcher.close();
			if (!detect()) {
				makeJs();
			}
			process.nextTick(watch);
		}
	});
});
