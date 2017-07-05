# preact-roller
A set of scripts and configurations to run Preact projects.

Highly inspired on [react-scripts](https://www.npmjs.com/package/react-scripts).

### Requirements
Preact Roller requires at least **Node 6** but an 8 version is highly recommended.

### Installation
Install it on your project with `npm install --save-dev preact-roller`.

Then add the following scripts to the NPM scripts property of your package.json:

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
 