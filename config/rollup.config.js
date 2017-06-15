const alias = require('rollup-plugin-alias');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const eslint = require('rollup-plugin-eslint');
const fs = require('fs-extra');
const json = require('rollup-plugin-json');
const multiEntry = require('rollup-plugin-multi-entry');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const rollup = require('rollup').rollup;
const uglify = require('rollup-plugin-uglify');

const filterNulls = arr => arr.filter(x => !!x);

module.exports = ({ paths, preactrc }) => {
  let cache = null;

  const isProduction = process.env.NODE_ENV === 'production';
  const { name, version } = fs.readJsonSync(paths.packageJson);

  const config = {
    entry: paths.indexJS,
    cache: isProduction ? null : cache,
    plugins: filterNulls([
      json(),
      multiEntry(),
      eslint({
        configFile: paths.eslintrc,
        exclude: [`${paths.nodeModules}/**`, `${paths.public}/**`],
        include: [`${paths.src}/**`],
        useEslintrc: false,
        throwError: isProduction,
      }),
      alias({
        react: paths.preactCompat,
        'react-dom': paths.preactCompat,
      }),
      nodeResolve({
        extensions: ['.js', '.jsx'],
        module: true,
        jsnext: true,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
      commonjs({
        include: [`${paths.nodeModules}/**`],
        namedExports: preactrc.resolve,
      }),
      buble({
        jsx: 'h',
        objectAssign: 'Object.assign',
        transforms: {
          modules: false,
        },
      }),
      isProduction ? uglify() : null,
    ]),
  };

  const generateBanner = () => (
    fs.readFileSync(paths.banner, 'utf-8')
      .replace('{{-name}}', name)
      .replace('{{-version}}', version)
  );

  return rollup(config).then((bundle) => {
    const bundleOptions = {
      banner: preactrc.bundle.banner ? generateBanner() : null,
      format: 'iife',
      moduleName: name,
      sourceMap: isProduction ? true : 'inline',
    };
    cache = bundle;
    return bundle.generate(bundleOptions);
  });
};
