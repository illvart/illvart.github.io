'use strict';

const fs = require('fs');
const del = require('del');
const yaml = require('js-yaml');

const gulp = require('gulp');
const debug = require('gulp-debug');

const data = require('gulp-data');
const nunjucks = require('gulp-nunjucks');
const _nunjucks = require('nunjucks');
const markdown = require('nunjucks-markdown');
const marked = require('marked');
const frontMatter = require('gulp-front-matter');

const htmlmin = require('gulp-html-minifier-terser');
const inject = require('gulp-inject-string');
const sitemap = require('gulp-sitemap');
const prettyData = require('gulp-pretty-data');
const browserSync = require('browser-sync').create();

const output = 'public';
const config = yaml.safeLoad(fs.readFileSync('./data/config.yml', 'utf8'));

const envMode = (mode) => (cb) => ((process.env.NODE_ENV = mode), cb());

const server = (cb) => {
  browserSync.init({
    server: {
      baseDir: output,
    },
    ...(config.dev.host && {host: config.dev.host}),
    ...(config.dev.port && {port: config.dev.port}),
    watch: true,
    open: false,
    notify: false,
    online: false,
    logPrefix: config.shortTitle,
    logLevel: 'warn',
    logConnections: false,
  });
  cb();
};

// extending nunjucks
const env = new _nunjucks.Environment(new _nunjucks.FileSystemLoader('./src/templates'), {
  throwOnUndefined: true,
  trimBlocks: true,
  lstripBlocks: true,
});
env.addGlobal('mode', process.env.NODE_ENV);
env.addGlobal('host', `http://${config.dev.host}:${config.dev.port}`);
env.addFilter('toEncodeURI', (str) => encodeURI(str));
env.addFilter('toUnderscore', (str) => str.split('-').join('_'));
env.addFilter('stripProtocol', (str) => str.split(/https?:\/\//gi).join(''));

// extending markdown
// https://github.com/markedjs/marked
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  const internalLink = href.startsWith(config.url) || href.startsWith('/');
  const link = linkRenderer.call(renderer, href, title, text);
  return internalLink ? link : link.replace(/^<a /, `<a target="_blank" rel="noopener noreferrer" `);
};
marked.setOptions({
  renderer,
  gfm: true,
  mangle: true,
  tables: true,
  smartLists: true,
  smartypants: true,
});
markdown.register(env, marked);

// nunjucks render
gulp.task('nunjucks:render', () =>
  gulp
    .src('./src/pages/**/*.+(html|md)')
    .pipe(
      frontMatter({
        property: 'data',
      }),
    )
    .pipe(
      data((f) => ({
        data: f.data,
        fileName: f.path.split(`${f.base}/`).join('').split('.').slice(0, -1).join(),
        pathName: f.path.split(`${f.cwd}/`).join(''),
      })),
    )
    .pipe(nunjucks.compile({config}, {env}))
    .pipe(gulp.dest(output))
    .pipe(browserSync.stream()),
);

// watch nunjucks
gulp.task('nunjucks:watch', () => {
  gulp.watch(
    ['./src/templates/**/*.njk', './src/pages/**/*.+(html|md)'],
    gulp.parallel('nunjucks:render', (cb) => {
      browserSync.reload();
      cb();
    }),
  );
});

// sitemap generator
gulp.task('sitemap', () =>
  gulp
    .src(`${output}/**/*.html`, {
      read: false,
    })
    .pipe(
      sitemap({
        siteUrl: `${config.url}`,
      }),
    )
    .pipe(debug({title: 'Generate sitemap:'}))
    .pipe(gulp.dest(output)),
);

// inject sitemap url to robots.txt
gulp.task('robots.txt', () =>
  gulp
    .src('./src/robots.txt')
    .pipe(inject.append(`\nSitemap: ${config.url}/sitemap.xml`))
    .pipe(debug({title: 'Inject sitemap URL:'}))
    .pipe(gulp.dest(output)),
);

// minify html
gulp.task('minify:html', () =>
  gulp
    .src(`${output}/**/*.html`)
    .pipe(
      htmlmin({
        html5: true,
        useShortDoctype: true,
        decodeEntities: false, // Avoid decode email address
        collapseBooleanAttributes: true,
        collapseWhitespace: false,
        preventAttributesEscaping: true,
        removeAttributeQuotes: false,
        removeComments: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeEmptyAttributes: true,
        removeOptionalTags: false,
        removeTagWhitespace: false,
        minifyCSS: true,
        minifyJS: true,
      }),
    )
    .pipe(gulp.dest(output)),
);

const minifyPrettify = ['./src/site.webmanifest', `${output}/**/*.+(xml|json)`];

// Minify xml, json
gulp.task('minify', () =>
  gulp
    .src(minifyPrettify)
    .pipe(
      prettyData({
        type: 'minify',
        preserveComments: true,
        extensions: {
          xlf: 'xml',
          webmanifest: 'json',
        },
      }),
    )
    .pipe(debug({title: 'Minify:'}))
    .pipe(gulp.dest(output)),
);
// Prettify xml, json
gulp.task('prettify', () =>
  gulp
    .src(minifyPrettify)
    .pipe(
      prettyData({
        type: 'prettify',
        extensions: {
          xlf: 'xml',
          webmanifest: 'json',
        },
      }),
    )
    .pipe(debug({title: 'Prettify:'}))
    .pipe(gulp.dest(output)),
);

gulp.task('clean', () => del([output]));
gulp.task('copy', () => gulp.src(['./src/assets/**']).pipe(gulp.dest(output)));

exports.clean = gulp.series('clean');

// development mode: yarn dev
exports.dev = gulp.series(
  envMode('development'),
  'clean',
  'nunjucks:render',
  'sitemap',
  'robots.txt',
  'copy',
  'prettify',
  gulp.parallel(server, 'nunjucks:watch', (cb) => cb()),
);

// production mode: yarn build
exports.default = gulp.series(
  envMode('production'),
  'clean',
  'nunjucks:render',
  'sitemap',
  'robots.txt',
  'copy',
  'minify:html',
  'minify',
  (cb) => cb(),
);
