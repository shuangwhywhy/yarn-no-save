#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { userInfo } = require('os');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const { ifStatement, callExpression, memberExpression, stringLiteral, identifier, blockStatement, returnStatement, STATEMENT_OR_BLOCK_KEYS } = require('@babel/types');

const { uid, gid } = userInfo();
const cwd = process.cwd();

function exec (cmd, ...args) {
	console.log(`[cmd] > ${cmd} ${args.join(' ')}`);
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

function run () {
	const whereIsYarn = exec('readlink', '-f', '`which yarn`');
	const file = path.resolve(whereIsYarn, '../../lib/cli.js');
	const ast = parse(fs.readFileSync(file).toString());
	traverse(ast, {
		enter(p) {
			if (p.isAssignmentExpression() &&
				p.get('left').isMemberExpression() &&
				p.get('left').get('property').isIdentifier({ name: 'saveRootManifests' }) &&
				p.get('right').isCallExpression() &&
				p.get('right').get('callee').isFunctionExpression()
			) {
				const body = p.get('right').get('callee').get('body');
				const first = body.get('body')[0];
				if (first.isIfStatement() &&
					first.get('test').isCallExpression() &&
					first.get('test').get('arguments')[0].isStringLiteral({ value: '--no-save' })
				) {
					console.log('found');
					return;
				}
				body.unshiftContainer('body',
					ifStatement(
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
						blockStatement([returnStatement()])
					)
				);
				console.log('done');
			}
		}
	});
	const code = generate(ast).code;
	// const ast2 = parse(code);
	// traverse(ast2, {
	// 	enter(p) {
	// 		if (p.isAssignmentExpression() &&
	// 			p.get('left').isMemberExpression() &&
	// 			p.get('left').get('property').isIdentifier({ name: 'saveRootManifests' }) &&
	// 			p.get('right').isCallExpression() &&
	// 			p.get('right').get('callee').isFunctionExpression()
	// 		) {
	// 			const body = p.get('right').get('callee').get('body');
	// 			console.log(body.node.body);
	// 		}
	// 	}
	// })
	fs.writeFileSync(file, code);
}

run();
