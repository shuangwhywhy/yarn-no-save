const webpack = require('webpack');
const ShebangPlugin = require('webpack-shebang-plugin');
const path = require('path');
const fs = require('fs-extra');

fs.removeSync(path.resolve(__dirname, 'dist'));

webpack({
	mode: 'development',
	entry: {
		index: './src/index.js',
		install: './src/install.js',
		watch: './src/watch.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.js/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				]
			}
		]
	},
	plugins: [new ShebangPlugin()]
}, (e) => {
	console.dir(e, {depth: 1})
});
