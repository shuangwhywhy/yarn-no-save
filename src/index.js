#!/usr/bin/env node

import { reset, makeJs } from './make.js';

if (process.argv.includes('reset')) {
	reset();
}
else {
	makeJs();
}
