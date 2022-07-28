#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { userInfo } = require('os');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const { ifStatement, callExpression, memberExpression, stringLiteral, identifier, blockStatement, returnStatement, logicalExpression, expressionStatement } = require('@babel/types');

const { uid, gid } = userInfo();
const cwd = process.cwd();

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

function reset() {
	const whereIsYarn = exec('readlink', '-f', '`which yarn`');
	const file = path.resolve(whereIsYarn, '../../lib/cli.js');
	const ast = parse(fs.readFileSync(file).toString());
	traverse(ast, {
		enter(p) {
			if (
				p.isIfStatement() &&
				p.get('test')?.isLogicalExpression({ operator: '||' }) &&
				p.get('test')?.get('left')?.get('arguments')[0]?.isStringLiteral({ value: '--no-save' }) &&
				p.get('test')?.get('right')?.get('arguments')[0]?.isStringLiteral({ value: '-N' })
			) {
				p.remove();
			}
			else if (
				p.isExpressionStatement() &&
				p.get('expression')?.isCallExpression() &&
				p.get('expression')?.get('callee')?.isMemberExpression() &&
				p.get('expression')?.get('callee')?.get('object')?.isIdentifier({ name: 'commander' }) &&
				p.get('expression')?.get('callee')?.get('arguments')[0]?.isStringLiteral({ value: '-N, --no-save' })
			) {
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
	const whereIsYarn = exec('readlink', '-f', '`which yarn`');
	const file = path.resolve(whereIsYarn, '../../lib/cli.js');
	const ast = parse(fs.readFileSync(file).toString());
	traverse(ast, {
		enter(p) {
			if (
				p.isAssignmentExpression() &&
				p.get('left')?.isMemberExpression() &&
				p.get('left')?.get('property')?.isIdentifier({ name: 'saveRootManifests' }) &&
				p.get('right')?.isCallExpression() &&
				p.get('right')?.get('callee')?.isFunctionExpression()
			) {
				const body = p.get('right').get('callee').get('body');
				const first = body.get('body')[0];
				if (
					first.isIfStatement() &&
					first.get('test')?.isLogicalExpression({ operator: '||' }) &&
					first.get('test')?.get('left')?.get('arguments')[0]?.isStringLiteral({ value: '--no-save' }) &&
					first.get('test')?.get('right')?.get('arguments')[0]?.isStringLiteral({ value: '-N' })
				) {
					return;
				}
				body.unshiftContainer('body',
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
						blockStatement([returnStatement()])
					)
				);
			}
			else if (
				p.isExpressionStatement() &&
				p.get('expression')?.isCallExpression() &&
				p.get('expression')?.get('callee')?.isMemberExpression() &&
				p.get('expression')?.get('callee')?.get('object')?.isIdentifier({ name: 'commander' }) &&
				p.get('expression')?.get('callee')?.get('arguments')[0]?.isStringLiteral({ value: 'add [packages ...] [flags]' })
			) {
				const next = p.getNextSibling();
				if (
					next.isExpressionStatement() &&
					next.get('expression')?.isCallExpression() &&
					next.get('expression')?.get('callee')?.isMemberExpression() &&
					next.get('expression')?.get('callee')?.get('object')?.isIdentifier({ name: 'commander' }) &&
					next.get('expression')?.get('callee')?.get('arguments')[0]?.isStringLiteral({ value: '-N, --no-save' })
				) {
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
