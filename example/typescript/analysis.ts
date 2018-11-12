#!/usr/bin/env node

"use strict";
import * as fs from 'fs';

function usage() {
    console.log(`usage: ${process.argv[1]} [*mythril-api-json-path*] [*timeout-secs*]

Run Mythril Platform analyses on *mythril-api-json-path*

Set environment variables EMAIL and MYTHRIL_API_KEY before using.
`)
    process.exit(1);
}

require('../helper');

const argLen = process.argv.length
if (argLen === 3 &&
    process.argv[2].match(/^[-]{0,2}h(?:elp)?$/)) {
    usage();
}

let timeout = 20
if (argLen >= 3 &&
    process.argv[argLen-1].match(/^\d+$/)) {
    timeout = parseInt(process.argv[argLen-1]);
}


const jsonPath = process.argv[2] || `${__dirname}/../sample-json/PublicArray.json`;

/**********************************
  Example code starts here ...
***********************************/

// What we use in a new armlet.Client()
interface ArmletOptions {
    apiKey: string;
    userEmail: string;
    platforms: Array<string>;
};

// What we use in a new armlet analyze call
interface AnalyzeOptions {
    data: any;  // Actually a JSON dictionary
    timeout: number;
};

const options = {
    apiKey: process.env.MYTHRIL_API_KEY,
    userEmail: process.env.EMAIL,
    platforms: []  // client chargeback
};

const armlet = require('../../index'); // if not installed
// import * as armlet from 'armlet' // if installed

const client = new armlet.Client(options)

const analyzeOptions = {
    data: JSON.parse(fs.readFileSync(jsonPath, 'utf8')),
    timeout: timeout * 1000  // convert secs to millisecs
}

client.analyze(analyzeOptions)
    .then(issues => {
        console.log(issues)
    }).catch(err => {
        console.log(err)
    })