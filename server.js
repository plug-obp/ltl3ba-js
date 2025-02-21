// Usage: node server.js --host=localhost --port=3000
// Description: A simple express server that runs ltl3ba to convert LTL formulas to Büchi automata.
// Dependencies: express, child_process, os

import os from 'os';
import express from 'express';
import { exec } from 'child_process';
const app = express();

const args = process.argv.slice(2);
const hostArg = args.find(arg => arg.startsWith('--host='));
const host = hostArg ? hostArg.split('=')[1] : 'localhost';

const portArg = args.find(arg => arg.startsWith('--port='));
const port = portArg ? parseInt(portArg.split('=')[1]) : 3000;

app.get('/ltl3ba/:formula', (req, res) => {
    const formula = req.params.formula;
    console.log(`LTL Formula: ${formula}`);
    
    const platform = os.platform();
    let ltl3ba;
    if (platform === 'darwin') {
        ltl3ba = './exe/darwin/ltl3ba';
    } else if (platform === 'linux') {
        ltl3ba = './exe/linux/ltl3ba';
    } else if (platform === 'win32') {
        ltl3ba = './exe/win32/ltl3ba.exe';
    }

    exec(`${ltl3ba} -T3 -f "${formula}"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            res.status(500).send({status: 'error', message: error.message});
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            res.send({status: 'error', message: stderr});
            return;
        }
        res.send({status: 'ok', automata: stdout});
    });
});

const server = app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
});

server.on('error', (err) => {
    console.error('Server error:', err.message.substring(0, 100) + '...');
    server.close();
});