const postcssCssO = require('postcss-csso');
const postcssCssNext = require('postcss-cssnext');
const fs = require('fs-extra');
const postcss = require('postcss');
const stylelint = require('stylelint');

module.exports = ({ paths }) => (
  new Promise((resolve) => {
    const isProduction = process.env.NODE_ENV === 'production';
    let processOptions = {};

    fs.readFile(paths.indexCSS, 'utf8', (readErr, str) => {
      if (readErr) {
        throw new Error(readErr);
      }
      const processor = postcss();

      processor.use(stylelint({
        configFile: paths.stylelintrc,
      }));

      processor.use(postcssCssNext({
        browsers: 'last 8 versions',
      }));

      if (isProduction) {
        processor.use(postcssCssO());

        processOptions = {
          map: {
            inline: false,
          },
        };
      }

      processor
        .process(str, processOptions)
        .then((result) => {
          resolve(result);
        });
    });
  })
);
