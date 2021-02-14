/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-call */
const gulp = require(`gulp`);
const ts = require(`gulp-typescript`);
const LinfraCore = require(`@linfra/core`);

const GulpCommon = require(`./common.gulp`);

module.exports = LinfraCore.Helpers.GulpHelper.combineGulpFiles(
  GulpCommon,
);
exports = module.exports;

const sourceFolder = `./src`;
const distFolder = `./dist`;

/**
 * TS Compilator
 */

const devTSConfig = ts.createProject(`./tsconfig.json`);

exports[`build:ts`] = function buildTSTask () {
  return gulp.src(`${sourceFolder}/**/*.ts`)
    .pipe(devTSConfig())
    .on('error', () => { /* Ignore compiler errors */})
    .pipe(gulp.dest(`${distFolder}`));
};

exports[`build:src`] = gulp.series(
  exports[`build:ts`],
  exports[`move:jts`],
);

exports[`build`] = gulp.series(
  exports[`eslint`],
  exports[`clear:test`],
  exports[`build:src`],
);

exports[`build:ext`] = function buildMoveTask () {
  return gulp.src([
    `./src/manifest.json`,
    `./src/devtools.html`,
  ])
    .pipe(
      gulp.dest(distFolder),
    );
};
