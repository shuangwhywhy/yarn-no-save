const fs = require('fs');
const path = require('path');
const Single = require('single-instance');
const whereIsYarn = exec('readlink', '-f', '`which yarn`');
const yarnCliFile = path.resolve(whereIsYarn, '../../lib/cli.js');

new Single('yarn-cli-watcher')
.lock()
.then(() => {
	fs.watch(yarnCliFile, {
		persistent: true
	}, (event, trigger) => {
		console.log(event, trigger);
	});
});
