#!/usr/bin/env node

import { homedir } from 'os';
import path from 'path';
import { reset, makeJs, exec, detect } from './make.js';

const home = homedir();
const launchdPath = path.resolve(home, 'Library/LaunchAgents/yarn-watcher.plist');

if (process.argv.includes('reset')) {
	exec('launchctl', 'stop', 'yarn-watcher');
	reset();
}
else if (process.argv.includes('start')) {
	exec('launchctl', 'start', 'yarn-watcher');
}
else if (process.argv.includes('stop')) {
	exec('launchctl', 'stop', 'yarn-watcher');
}
else if (process.argv.includes('reload')) {
	exec('launchctl', 'stop', 'yarn-watcher');
	exec('launchctl', 'start', 'yarn-watcher');
}
else if (process.argv.includes('restart')) {
	exec('launchctl', 'stop', 'yarn-watcher');
	exec('launchctl', 'unload', launchdPath);
	exec('launchctl', 'load', launchdPath);
	exec('launchctl', 'start', 'yarn-watcher');
}
else if (process.argv.includes('check') || process.argv.includes('validate')) {
	if (detect()) {
		console.log();
		console.log('ok');
		console.log();
	}
	else {
		console.log();
		console.log('not found');
		console.log();
	}
}
else {
	makeJs();
}
