#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { userInfo } = require('os');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const { ifStatement, callExpression, memberExpression, stringLiteral, identifier, blockStatement, returnStatement, logicalExpression, expressionStatement, functionExpression } = require('@babel/types');

const { uid, gid } = userInfo();
const cwd = process.cwd();
const whereIsYarn = exec('readlink', '-f', '`which yarn`');

function exec (cmd, ...args) {
	const PATH = process?.env?.PATH?.split(':')?.filter(p => !/^\/var\/folders\//.test(p))?.join(':');
	const { stdout, stderr } = spawnSync(cmd, args, {	// ignore_security_alert
		cwd, uid, gid, shell: process.env.SHELL, env: {
			...process.env,
			PATH
		}
	});
	const errStr = stderr.toString().replace(/\n+$/, '');
	if (errStr) {
		console.error(errStr);
	}
	return stdout.toString().replace(/\n+$/, '');
}

function _isSavingManifest(nodePath) {
	return nodePath.isAssignmentExpression() &&
		nodePath.get('left')?.isMemberExpression() &&
		nodePath.get('left')?.get('property')?.isIdentifier({ name: 'saveRootManifests' }) &&
		nodePath.get('right')?.isCallExpression() &&
		nodePath.get('right')?.get('callee')?.isFunctionExpression()
}

function _isNoSaveLogic(nodePath) {
	return nodePath.isIfStatement() &&
		nodePath.get('test')?.isLogicalExpression({ operator: '||' }) &&
		nodePath.get('test')?.get('left')?.get('arguments')[0]?.isStringLiteral({ value: '--no-save' })
}

function _isAddHelpMsg(nodePath) {
	return nodePath.isExpressionStatement() &&
		nodePath.get('expression')?.isCallExpression() &&
		nodePath.get('expression')?.get('callee')?.isMemberExpression() &&
		nodePath.get('expression')?.get('callee')?.get('object')?.isIdentifier({ name: 'commander' }) &&
		nodePath.get('expression')?.get('arguments')[0]?.isStringLiteral({ value: 'add [packages ...] [flags]' })
}

function _isNoSaveHelpMsg(nodePath) {
	return nodePath.isExpressionStatement() &&
		nodePath.get('expression')?.isCallExpression() &&
		nodePath.get('expression')?.get('callee')?.isMemberExpression() &&
		nodePath.get('expression')?.get('callee')?.get('object')?.isIdentifier({ name: 'commander' }) &&
		nodePath.get('expression')?.get('arguments')[0]?.isStringLiteral({ value: '-N, --no-save' })
}

function reset() {
	const file = path.resolve(whereIsYarn, '../../lib/cli.js');
	const ast = parse(fs.readFileSync(file).toString());
	traverse(ast, {
		enter(p) {
			if (_isNoSaveLogic(p)) {
				p.remove();
			}
			else if (_isNoSaveHelpMsg(p)) {
				p.remove();
			}
		}
	});
	const code = generate(ast, {
		quotes: 'single'
	}).code;
	fs.writeFileSync(file, code);
}

function makeJs() {
	const file = path.resolve(whereIsYarn, '../../lib/cli.js');
	const ast = parse(fs.readFileSync(file).toString());
	traverse(ast, {
		enter(p) {
			if (_isSavingManifest(p)) {
				const body = p.get('right').get('callee').get('body');
				const statements = body.get('body');
				const beforeReturn = statements[statements.length - 2];
				if (beforeReturn && _isNoSaveLogic(beforeReturn)) {
					return;
				}
				beforeReturn.insertAfter(
					ifStatement(
						logicalExpression(
							'||',
							callExpression(
								memberExpression(
									memberExpression(
										identifier('process'),
										identifier('argv')
									),
									identifier('includes')
								),
								[stringLiteral('--no-save')]
							),
							callExpression(
								memberExpression(
									memberExpression(
										identifier('process'),
										identifier('argv')
									),
									identifier('includes')
								),
								[stringLiteral('-N')]
							)
						),
						blockStatement([
							returnStatement(
								functionExpression(
									undefined, [], blockStatement([])
								)
							)
						])
					)
				);
			}
			else if (_isAddHelpMsg(p)) {
				const next = p.getNextSibling();
				if (_isNoSaveHelpMsg(next)) {
					return;
				}
				p.insertAfter([
					expressionStatement(
						callExpression(
							memberExpression(
								identifier('commander'),
								identifier('option')
							),
							[
								stringLiteral('-N, --no-save'),
								stringLiteral('yarn add without saving record to package.json')
							]
						)
					)
				]);
			}
		}
	});
	const code = generate(ast, {
		quotes: 'single',
	}).code;
	fs.writeFileSync(file, code);
}

if (process.argv.includes('reset')) {
	reset();
}
else {
	makeJs();
}
