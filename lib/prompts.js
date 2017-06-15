'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');

module.exports.requestPortChange = (port) => {
  console.log(chalk.yellow(`Something is already running at port ${port}.`));
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'changePort',
      message: 'Would you like to run the app at another port instead?',
      default:true,
    },
    {
      type: 'input',
      name: 'port',
      message: 'What port?',
      when: answers => answers.changePort,
    },
  ]);
};
