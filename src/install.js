#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { exec } from './make.js';

if (process.argv.includes('--debug')) {
	process.env.YNS_LOG_LEVEL = 'debug';
}

const home = homedir();
const launchdPath = path.resolve(home, 'Library/LaunchAgents/yarn-watcher.plist');

const whereIsWatcher = exec('readlink', '-f', '`which yarn-watcher`');
const whereIsNode = exec('which', 'node');
const out = path.resolve(home, '.yarn-watcher.out');
const err = path.resolve(home, '.yarn-watcher.err');

fs.writeFileSync(launchdPath, `<plist version="1.0">
	<dict>
		<key>Label</key>
		<string>yarn-watcher</string>
		<key>ProgramArguments</key>
		<array>
			<string>${whereIsNode}</string>
			<string>${whereIsWatcher}</string>
		</array>
		<key>RunAtLoad</key>
		<true/>
		<key>KeepAlive</key>
		<true/>
		<key>Crashed</key>
		<true/>
		<key>StandardErrorPath</key>
		<string>${err}</string>
		<key>StandardOutPath</key>
		<string>${out}</string>
		<key>EnvironmentVariables</key>
		<dict>${Object.entries(process.env).map(([key, value]) => `
			<key>${key}</key>
			<string>${value}</string>`).join('')}
		</dict>
	</dict>
</plist>`);

process.nextTick(() => {
	exec('launchctl', 'stop', 'yarn-watcher');
	exec('launchctl', 'unload', launchdPath);
	exec('launchctl', 'load', launchdPath);
	exec('launchctl', 'start', 'yarn-watcher');
});
