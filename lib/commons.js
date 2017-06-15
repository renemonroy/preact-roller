'use strict';

const crypto = require('crypto');
const deepmerge = require('deepmerge');
const detectPort = require('detect-port');
const fs = require('fs-extra');
const path = require('path');
const pathsJson = require('../config/paths.json');

/**
 * Private Methods
 * ------------------------------------------------------------------------ */

const buildLinkTag = src => (
  `<link rel="stylesheet" type="text/css" href="${src}">`
);

const buildScriptTag = src => (
  `<script src="${src}" type="text/javascript" charset="utf-8"></script>`
);

const resolvePaths = (directory) => {
  const paths = {};
  const modulePath = 'node_modules/preact-roller';
  Object.keys(pathsJson).forEach((pathKey) => {
    const currPath = pathsJson[pathKey];
    const str = '{{-modulePath}}';
    let tempPath = currPath.indexOf(str) !== -1 ?
      currPath.replace(str, modulePath) : currPath;
    paths[pathKey] = path.resolve(directory, tempPath);
  });
  paths.htmlBuild = `${paths.build}/index.html`;
  return paths;
};

/**
 * Public Methods
 * ------------------------------------------------------------------------ */

module.exports.createConfig = (directory) => {
  const currentDirectory = fs.realpathSync(directory);
  const paths = resolvePaths(currentDirectory);
  const preactrc = JSON.parse(fs.readFileSync(paths.preactrc, 'utf8'));
  const preactrcPatch = `${currentDirectory}/.preactrc`;
  let config = { preactrc, paths };
  if (fs.existsSync(preactrcPatch)) {
    config.preactrc = deepmerge(
      preactrc,
      JSON.parse(fs.readFileSync(preactrcPatch, 'utf8'))
    );
  }
  config.paths.jsBuild = `${paths.build}/${config.preactrc.bundle.destJS}`;
  config.paths.cssBuild = `${paths.build}/${config.preactrc.bundle.destCSS}`;
  return config;
};

module.exports.endWithError = (err) => {
  console.log(`${err.message || err}\n`);
  process.exit(1);
};

module.exports.ensureAvailablePort = (portToTest, prompter) => (
  new Promise((resolve, reject) => {
    const detectAvailablePort = (ptt) => {
      detectPort(ptt).then((port) => {
        if (port === ptt) {
          resolve(ptt);
        } else {
          prompter(ptt).then(({ changePort, port: newPort }) => {
            if (!changePort) {
              reject('Aborted.');
            } else {
              detectAvailablePort(parseInt(newPort, 10));
            }
          });
        }
      });
    };
    detectAvailablePort(portToTest);
  })
);

module.exports.ensureBundleDirectory = (config) => (
  new Promise((resolve, reject) => {
    if (!fs.existsSync(config.paths.indexHTML)) {
      return reject(new Error('[ERROR] Index html not found.'));
    }
    fs.ensureDirSync(config.paths.build);
    fs.emptyDirSync(config.paths.build);
    fs.copySync(config.paths.public, config.paths.build);
    return resolve(config);
  })
);

module.exports.hashBundle = (buildFilePath, bundle) => (
  new Promise((resolve) => {
    const hash = crypto.createHash('sha1')
      .update(bundle.code || bundle.css)
      .digest('hex')
      .slice(0, 10);
    const destPath = buildFilePath.replace(/.js|.css/gi, (ext) => (
      `.${hash}${ext}`
    ));
    resolve({ destPath, bundle });
  })
);

module.exports.updateIndexHtml = (config, destJS, destCSS) => (
  new Promise((resolve, reject) => {
    fs.readFile(config.paths.htmlBuild, 'utf-8', (readError, str) => {
      let result = null;
      if (readError) {
        reject(readError);
      } else {
        result = str
          .replace(/<\/head>/gi, `${buildLinkTag(destCSS || config.preactrc.bundle.destCSS)}\n</head>`)
          .replace(/<\/body>/gi, `${buildScriptTag(destJS || config.preactrc.bundle.destJS)}\n</body>`);
        fs.writeFile(config.paths.htmlBuild, result, 'utf-8', (writeError) => {
          if (writeError) {
            reject(writeError);
          }
          resolve(config);
        });
      }
    })
  })
);

module.exports.writeBuildFiles = (destPath, bundle) => (
 new Promise((resolve, reject) => {
   try {
     const destMapPath =`${destPath}.map`;
     const filename = path.basename(destPath);
     const isProduction = process.env.NODE_ENV === 'production';
     const code = (bundle.code || bundle.css).split('/*# sourceMappingURL=')[0];
     const result = isProduction ? `${code}\n/*# sourceMappingURL=${filename}.map */` : code;
     fs.ensureFileSync(destPath);
     fs.writeFileSync(destPath, result, 'utf-8');
     if (isProduction && bundle.map) {
       fs.ensureFileSync(destMapPath);
       fs.writeFileSync(destMapPath, bundle.map, 'utf-8');
     }
     resolve();
   } catch (err) {
     return reject(err);
   }
 })
);
