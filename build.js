const { transform } = require('@babel/core');
const path = require('path');
const fs = require('fs-extra');
const outputDir = path.resolve(__dirname, 'dist');

fs.removeSync(outputDir)
fs.ensureDirSync(outputDir);

fs.readdirSync(path.resolve(__dirname, 'src')).map(filename => {
	const input = path.resolve(__dirname, 'src', filename);
	const output = path.resolve(outputDir, filename);
	// ignore_security_alert
	transform(fs.readFileSync(input).toString(), {
		presets: ['@babel/preset-env']
	}, (err, result) => {
		if (!err) {
			fs.writeFile(output, '#!/usr/bin/env node\n\n' + result.code, () => {
				fs.chmod(output, 0o774)
			});
		}
	});
});
