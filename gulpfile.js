/*eslint-env node */
'use strict';

const fs = require('fs');
const zlib = require('zlib');
const workbox = require('workbox-build');

const {task, src, dest, watch, series, parallel} = require('gulp');

const gulpDebug = require('gulp-debug');
const gulpReplace = require('gulp-replace');
const gulpRename = require('gulp-rename');
const gulpData = require('gulp-data');

const gulpBrotli = require('gulp-brotli');
const gulpZopfli = require('gulp-zopfli-green');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpBabelMinify = require('gulp-babel-minify');
const gulpPrettier = require('gulp-prettier');
const gulpHtmlMinifierTerser = require('gulp-html-minifier-terser');

const gulpGrayMatter = require('gulp-gray-matter');
const gulpNunjucks = require('gulp-nunjucks');
const njk = require('nunjucks');
const markdownNunjucks = require('nunjucks-markdown');
const marked = require('marked');

const gulpSitemap = require('gulp-sitemap');
const gulpPrettyData = require('gulp-pretty-data');
const prettyData = require('pretty-data');
const browserSync = require('browser-sync').create();

const config = require('js-yaml').safeLoad(fs.readFileSync('./data/config.yml', 'utf8'));
const randomId = require('crypto').randomBytes(6).toString('hex');

const baseDir = './src';
const outputDir = './dist';
const nodeModules = './node_modules';
const source = {
  js: {
    dev: `app.chunk.js`,
    prod: `app.${randomId}.min.js`,
  },
};

const nodeEnv = process.env.NODE_ENV;
const mode = (val) => (callback) => ((process.env.NODE_ENV = val), callback());

const reload = (done) => {
  browserSync.reload();
  done();
};

process.on('unhandledRejection', (reason, p) => {
  console.error('Build had unhandled rejection', reason, p);
  throw new Error(`Build had unhandled rejection ${reason}`);
});

task('clean', () => require('del')([outputDir]));

task('serve', (callback) => {
  browserSync.init({
    server: {
      baseDir: outputDir,
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    ...(config.dev.host && {host: config.dev.host}),
    ...(config.dev.port && {port: config.dev.port}),
    watch: true,
    open: false,
    notify: false,
    online: false,
    logPrefix: config.shortTitle,
    logConnections: false,
    minify: false,
    callbacks: {
      ready: (err, bs) => {
        bs.addMiddleware('*', (req, res) => {
          res.writeHead(302, {
            location: '404',
          });
          res.end();
        });
      },
    },
  });
  callback();
});

// bundle JavaScript for development
task('js:dev', () => {
  return src(`${baseDir}/app.js`)
    .pipe(gulpReplace('__URL__', config.url.split(/https?:\/\//).join('')))
    .pipe(gulpReplace('__REDIRECT__', config.redirect.url.split(/https?:\/\//).join('')))
    .pipe(gulpSourcemaps.init({largeFile: false}))
    .pipe(gulpPrettier())
    .pipe(gulpRename(source.js.dev))
    .pipe(gulpSourcemaps.write('.'))
    .pipe(dest(outputDir))
    .pipe(browserSync.stream());
});
task('watch:js', () => {
  watch(`${baseDir}/**/*.js`, series('js:dev', reload));
});

// bundle JavaScript for production
task('js:prod', () => {
  return src(`${baseDir}/app.js`)
    .pipe(gulpReplace('__URL__', config.url.split(/https?:\/\//).join('')))
    .pipe(gulpReplace('__REDIRECT__', config.redirect.url.split(/https?:\/\//).join('')))
    .pipe(gulpSourcemaps.init({largeFile: false}))
    .pipe(
      gulpBabelMinify({
        mangle: {
          keepClassName: true,
          topLevel: true,
        },
      }),
    )
    .pipe(gulpRename(source.js.prod))
    .pipe(gulpSourcemaps.write('.'))
    .pipe(dest(outputDir));
});

// copy modules into dest
task('module', () => {
  return src([`${nodeModules}/quicklink/dist/quicklink.umd.js`]).pipe(dest(outputDir));
});

// template render
task('template', () => {
  // extending nunjucks
  const env = new njk.Environment(new njk.FileSystemLoader(`${baseDir}/templates`), {
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true,
  });
  env.addGlobal('mode', nodeEnv);
  env.addGlobal('host', `http://${config.dev.host}:${config.dev.port}`);
  env.addFilter('toEncodeURI', (str) => encodeURI(str));
  env.addFilter('toUnderscore', (str) => str.split('-').join('_'));
  env.addFilter('stripProtocol', (str) => str.split(/https?:\/\//).join(''));
  env.addFilter('toTitleCase', (str) => str.toLowerCase().replace(/(?:^|\s|-)\S/g, (x) => x.toUpperCase()));

  function minifyJson() {
    this.tags = ['startMinifyJson'];
    this.parse = (parser, nodes, lexer) => {
      const tok = parser.nextToken();
      parser.advanceAfterBlockEnd(tok.value);
      const body = parser.parseUntilBlocks('endMinifyJson');
      parser.advanceAfterBlockEnd();
      return new njk.nodes.CallExtension(this, 'run', null, [body]);
    };
    this.run = (ctx, body) => {
      let data;
      const {pd} = prettyData;
      if (nodeEnv === 'production') {
        data = pd.jsonmin(body());
      } else {
        data = pd.json(body());
      }
      return new njk.runtime.SafeString(data);
    };
  }
  env.addExtension('minifyJson', new minifyJson());

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
  markdownNunjucks.register(env, marked);

  return src(`./pages/**/*.{md,html}`)
    .pipe(
      gulpGrayMatter({
        property: 'data',
        remove: true,
      }),
    )
    .pipe(
      gulpData((file) => ({
        data: file.data,
        fileName: file.path.split(`${file.base}/`).join('').split('.').slice(0, -1).join(''),
        pathName: file.path.split(`${file.cwd}/`).join(''),
        normalize: fs.readFileSync(`${nodeModules}/modern-normalize/modern-normalize.css`, 'utf8'),
        // Dynamic JS name
        app_js: nodeEnv === 'production' ? source.js.prod : source.js.dev,
      })),
    )
    .pipe(gulpNunjucks.compile({config}, {env}))
    .pipe(dest(outputDir))
    .pipe(browserSync.stream());
});
task('watch:template', () => {
  watch([`${baseDir}/templates/**/*.njk`, `./pages/**/*.{md,html}`], series('template', reload));
});

// sitemap generator
task('sitemap', () => {
  return src(`${outputDir}/**/*.html`, {
    read: false,
  })
    .pipe(
      gulpSitemap({
        siteUrl: config.url,
        priority: (siteUrl, loc, entry) => (loc.split('/').length === 0 ? 1 : 0.5),
      }),
    )
    .pipe(gulpDebug({title: 'Generate sitemap:'}))
    .pipe(dest(outputDir));
});

// replace a string matches
task('replace', () => {
  return src([`${baseDir}/robots.txt`, `${baseDir}/site.webmanifest`])
    .pipe(gulpReplace('__SITEMAP__', `Sitemap: ${config.url}/sitemap.xml`))
    .pipe(gulpReplace('__NAME__', config.title))
    .pipe(gulpReplace('__SHORT_NAME__', config.shortTitle))
    .pipe(gulpReplace('__THEME_COLOR__', config.style.color))
    .pipe(dest(outputDir));
});

// minify html
task('minify:html', () => {
  return src(`${outputDir}/**/*.html`)
    .pipe(
      gulpHtmlMinifierTerser({
        html5: true,
        useShortDoctype: true,
        decodeEntities: false, // Avoid decode email address
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        preventAttributesEscaping: true,
        removeAttributeQuotes: false,
        removeComments: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeEmptyAttributes: false,
        removeOptionalTags: false,
        removeTagWhitespace: false,
        minifyCSS: true,
        minifyJS: true,
      }),
    )
    .pipe(dest(outputDir));
});

const minifyPrettify = [`${outputDir}/**/*.{xml,json,webmanifest}`];

// Minify xml, json
task('minify', () => {
  return src(minifyPrettify)
    .pipe(
      gulpPrettyData({
        type: 'minify',
        preserveComments: true,
        extensions: {
          xlf: 'xml',
          webmanifest: 'json',
        },
      }),
    )
    .pipe(gulpDebug({title: 'Minify:'}))
    .pipe(dest(outputDir));
});

// Prettify xml, json
task('prettify', () => {
  return src(minifyPrettify)
    .pipe(
      gulpPrettyData({
        type: 'prettify',
        extensions: {
          xlf: 'xml',
          webmanifest: 'json',
        },
      }),
    )
    .pipe(gulpDebug({title: 'Prettify:'}))
    .pipe(dest(outputDir));
});

task('copy', () => {
  return src([`${baseDir}/assets/**/!(app.js)`]).pipe(dest(outputDir));
});

// workbox inject manifest
const swDest = `${outputDir}/sw.js`;
task('workbox', async () => {
  const workboxConfig = {
    swDest,
    swSrc: `${baseDir}/sw.js`,
    globDirectory: outputDir,
    globPatterns: ['**/*.{html,css,js,jpeg,jpg,png,gif,webp,ico,svg,woff2,woff,eot,ttf,otf}', 'offline/index.html'],
    globIgnores: ['images/shared/**/*', 'images/og.png'],
    // Increase the limit to 4mb
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
  };

  const injectManifest = workbox.injectManifest(workboxConfig);

  injectManifest
    .then(({warnings, count, size}) => {
      for (const warn of warnings) {
        console.warn(warn);
      }
      console.info(
        `Building the Service Worker manifest at ${swDest}. Caching ${count} files, totaling ${size} bytes.`,
      );
      workbox.copyWorkboxLibraries(outputDir).then((dir) => {
        if (!fs.existsSync(`${outputDir}/workbox`)) {
          fs.renameSync(`${outputDir}/${dir}`, `${outputDir}/workbox`);
        } else {
          fs.rmdirSync(`${outputDir}/${dir}`, {recursive: true});
        }
      });
    })
    .catch((err) => {
      console.warn(`Building the Service Worker manifest failed: ${err}`);
    });
});
task('watch:workbox', () => {
  watch(`${baseDir}/sw.js`, series('workbox', reload));
});
task('workbox:minify', () => {
  return src(swDest, {allowEmpty: true})
    .pipe(
      gulpBabelMinify({
        mangle: {
          keepClassName: true,
          topLevel: true,
        },
      }),
    )
    .pipe(dest(outputDir));
});

// inject license to js
task('license', (callback) => {
  const license = fs.readFileSync('./LICENSE', 'utf8');
  const js = [source.js.prod, swDest];
  js.forEach((file) => fs.appendFileSync(file, `\n/*\n${license}\n*/\n`));
  return callback();
});

task('zopfli', () => {
  return src(`${outputDir}/**/*.{js,css,svg}`)
    .pipe(
      gulpZopfli({
        format: 'gzip',
      }),
    )
    .pipe(dest(outputDir));
});
task('brotli', () => {
  return src(`${outputDir}/**/*.{js,css,svg}`)
    .pipe(
      gulpBrotli.compress({
        extension: 'br',
        //skipLarger: true,
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        },
      }),
    )
    .pipe(dest(outputDir));
});

exports.clean = series('clean');
exports.serve = series(mode('production'), 'serve');

// development mode
exports.dev = series(
  mode('development'),
  'clean',
  parallel('js:dev'),
  'module',
  'template',
  'sitemap',
  'replace',
  'prettify',
  'copy',
  'workbox',
  parallel('serve', 'watch:js', 'watch:template', 'watch:workbox', (callback) => callback()),
);

// production mode
exports.default = series(
  mode('production'),
  'clean',
  parallel('js:prod'),
  'module',
  'template',
  'sitemap',
  'replace',
  'minify:html',
  'minify',
  'copy',
  'workbox',
  'workbox:minify',
  'license',
  parallel('zopfli', 'brotli'),
  (callback) => callback(),
);
