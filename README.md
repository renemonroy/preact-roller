# preact-roller
[![npm](https://img.shields.io/npm/v/preact-roller.svg?style=flat-square)](https://www.npmjs.com/package/preact-roller)
[![npm](https://img.shields.io/npm/l/preact-roller.svg?style=flat-square)](https://www.npmjs.com/package/preact-roller)

### Overview
A set of scripts and configurations to run Preact projects.

Preact Roller is highly inspired on [react-scripts](https://www.npmjs.com/package/react-scripts).

### Requirements
Preact Roller requires at least **Node 6** but an 8 version is highly recommended.

### Installation

Use it with [preact-init](https://www.npmjs.com/package/preact-init) and initialize you app from different starting points (templates).

Or install it manually with `npm install --save-dev preact-roller` and add the following scripts to the NPM scripts property of your package.json:

| Scripts                            | Description                                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| preact-roller start                | Run the project within a dev server                           |
| preact-roller build                | Creates a bundle of the scripts and styles in production mode |

### Options

#### preact-roller start
 
 * `--port <number>` - Set a port to use for dev server. Alias `-p`.
 * `--debug` - Receive debugging info from Wright. Alias `-d`.

#### preact-roller build
 
 * `--banner` - Comments additional information at the top of the js bundle. Alias `-b`.
 