#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { homedir } = require('os');
const home = homedir();
const launchdPath = path.resolve(home, 'Library/LaunchAgents/yarn-watcher.plist');

if (fs.existsSync(launchdPath)) {
	fs.removeSync(launchdPath);
}

fs.writeFileSync(launchdPath, `<plist version="1.0">\
	<dict>\
		<key>Label</key>\
		<string>yarn-watcher</string>\
		<key>ProgramArguments</key>\
		<array>\
			<string>yarn-watcher</string>\
		</array>\
		<key>RunAtLoad</key>\
		<true/>\
		<key>StandardErrorPath</key>\
		<string>/dev/null</string>\
		<key>StandardOutPath</key>\
		<string>/dev/null</string>\
	</dict>\
</plist>`);
