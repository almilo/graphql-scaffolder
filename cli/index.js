#!/usr/bin/env node

const yargs = require('yargs');
const scaffoldSchema = require('./scaffold-schema');

yargs
    .usage('Usage: $0 <command> [options]')
    .strict()
    .help();

scaffoldSchema(yargs);

if (yargs.argv._.length === 0) {
    yargs.showHelp();
}
