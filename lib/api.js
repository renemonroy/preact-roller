'use strict';

const path = require('path');
const wright = require('wright');
const compileCSS= require('../config/postcss.config');
const compileJS = require('../config/rollup.config');
const {
  hashBundle,
  endWithError,
  ensureBundleDirectory,
  updateIndexHtml,
  writeBuildFiles,
} = require('./commons');

module.exports.start = (config) => {
  process.env.NODE_ENV = 'development';
  Promise.resolve()
    .then(() => ensureBundleDirectory(config))
    .then(() => updateIndexHtml(config))
    .then(() => {
      const { paths, preactrc } = config;
      const wrightConfig = {
        debug: preactrc.devServer.debug,
        css: {
          path: preactrc.bundle.destCSS,
          watch: `${paths.src}/**/*.{css}`,
          compile: () => compileCSS(config).then(bundle => bundle.css),
        },
        js: {
          path: preactrc.bundle.destJS,
          watch: `${paths.src}/**/*.{js,jsx}`,
          compile: () => compileJS(config).then(bundle => bundle.code),
        },
        main: paths.htmlBuild,
        port: parseInt(config.preactrc.devServer.port, 10) || 3000,
      };
      if (preactrc.devServer.inject) {
        wrightConfig.run = preactrc.devServer.refresher;
      }
      wright(wrightConfig);
    })
    .catch(endWithError);
};

module.exports.build = (config) => {
  process.env.NODE_ENV = 'production';
  const { paths } = config;
  let destCSS = null;
  let destJS = null;
  Promise.resolve()
    .then(() => ensureBundleDirectory(config))
    .then(() => compileJS(config))
    .then((bundle) => hashBundle(paths.jsBuild, bundle))
    .then(({ destPath, bundle }) => {
      destJS = config.preactrc.bundle.destJS.replace(
        path.basename(config.preactrc.bundle.destJS),
        path.basename(destPath)
      );
      return writeBuildFiles(destPath, bundle);
    })
    .then(() => compileCSS(config))
    .then((bundle) => hashBundle(paths.cssBuild, bundle))
    .then(({ destPath, bundle }) => {
      destCSS = config.preactrc.bundle.destCSS.replace(
        path.basename(config.preactrc.bundle.destCSS),
        path.basename(destPath)
      );
      return writeBuildFiles(destPath, bundle)
    })
    .then(() => updateIndexHtml(config, destJS, destCSS))
    .then(() => {
      console.log(`[LOG] Compiled successfully!\n`);
      process.exit();
    })
    .catch(endWithError);
};
