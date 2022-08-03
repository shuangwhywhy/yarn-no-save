#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import Single from 'single-instance';
import { makeJs, exec } from './make.js';

const whereIsYarn = exec('readlink', '-f', '`which yarn`');
const yarnCliFile = path.resolve(whereIsYarn, '../../lib/cli.js');

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
