'use strict';

const chalk = require('chalk');
const program = require('commander');
const { version } = require('../package.json');
const { requestPortChange } = require('./prompts');
const api = require('./api');
const {
  createConfig,
  ensureAvailablePort,
  endWithError,
} = require('./commons');

const config = createConfig(process.cwd());

program
  .version(version)
  .usage(`${chalk.green('<command>')} [options]`);

program
  .command('start')
  .description('Run the project within a dev server')
  .option('-p, --port <number>', 'Port to use', parseInt)
  .option('-d, --debug', 'Receive debugging info')
  .action((options) => {
    config.preactrc.devServer = Object.assign({}, config.preactrc.devServer, options);
    Promise.resolve()
      .then(() => ensureAvailablePort(config.preactrc.devServer.port, requestPortChange))
      .then((portSelected) => {
        config.preactrc.devServer.port = portSelected;
        api.start(config);
      })
      .catch(endWithError);
  });

program
  .command('build')
  .description('Create bundles of scripts and styles in production mode')
  .option('-b, --banner', 'Adds info at the top of the js bundle')
  .action((options) => {
    config.preactrc.bundle = Object.assign({}, config.preactrc.bundle, options);
    api.build(config);
  });

program
  .parse(process.argv);