const webpack = require('webpack');
const ShebangPlugin = require('webpack-shebang-plugin');
const path = require('path');
const fs = require('fs-extra');

fs.removeSync(path.resolve(__dirname, 'dist'));

webpack({
	mode: 'production',
	target: 'node',
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
				exclude: /node_modules/,
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
	plugins: [new ShebangPlugin()],
	
}, (e) => {
	e && console.log(e.toString());
});
