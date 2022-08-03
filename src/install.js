#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

const home = homedir();
const launchdPath = path.resolve(home, 'Library/LaunchAgents/yarn-watcher.plist');

if (fs.existsSync(launchdPath)) {
	fs.removeSync(launchdPath);
}

fs.writeFileSync(launchdPath, `<plist version="1.0">\n
	<dict>\n
		<key>Label</key>\n
		<string>yarn-watcher</string>\n
		<key>ProgramArguments</key>\n
		<array>\n
			<string>yarn-watcher</string>\n
		</array>\n
		<key>RunAtLoad</key>\n
		<true/>\n
		<key>StandardErrorPath</key>\n
		<string>/dev/null</string>\n
		<key>StandardOutPath</key>\n
		<string>/dev/null</string>\n
	</dict>\n
</plist>`);
