#!/usr/bin/env node

import fs from 'fs';
import Single from 'single-instance';
import { makeJs, exec, whereIsYarn, yarnCliFile, isDebug } from './make.js';

function detect() {
	const result = exec('grep', '-e', '"--no-save"', yarnCliFile);
	return !!result.trim();
}

new Single('yarn-cli-watcher')
.lock()
.then(function watch() {
	console.log('------------------------------------');
	isDebug && console.log('Yarn is installed at:');
	isDebug && console.log(whereIsYarn);
	isDebug && console.log('We are watching:');
	isDebug && console.log(yarnCliFile);
	isDebug && console.log('yarn-watcher start watching...');
	const watcher = fs.watch(yarnCliFile, {
		persistent: true
	}, (event) => {
		isDebug && console.log(`[${new Date().toISOString()}][event] ${event}`);
		if (event === 'rename') {
			watcher.close();
			console.log('Yarn is updated');
			if (!detect()) {
				console.log('--no-save option not found');
				makeJs();
				console.log('--no-save option added');
			}
			process.nextTick(watch);
		}
	});
});
