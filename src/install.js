#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

const home = homedir();
const launchdPath = path.resolve(home, 'Library/LaunchAgents/yarn-watcher.plist');

fs.writeFileSync(launchdPath, `<plist version="1.0">
	<dict>
		<key>Label</key>
		<string>yarn-watcher</string>
		<key>ProgramArguments</key>
		<array>
			<string>/usr/local/bin/yarn-watcher</string>
		</array>
		<key>RunAtLoad</key>
		<true/>
	</dict>
</plist>`);
