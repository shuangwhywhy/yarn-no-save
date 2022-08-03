#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { exec } from './make.js';

const home = homedir();
const launchdPath = path.resolve(home, 'Library/LaunchAgents/yarn-watcher.plist');
const whereIsWatcher = exec('readlink', '-f', '`which yarn-watcher`');
const whereIsNode = exec('which', 'node');

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
	</dict>
</plist>`);
