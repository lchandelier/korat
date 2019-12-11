"use strict";

/* plugins */
const axeA11y = require('gulp-axe-webdriver');
const browsersync = require('browser-sync').create();
const cheerio = require('gulp-cheerio');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const fileinclude = require('gulp-file-include');
const gulp = require('gulp');
const gulpFilter = require('gulp-filter');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const svgSymbols = require('gulp-svg-symbols');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const zip = require('gulp-zip');
        

/* paths */

const paths = {
    src: 'site/',
    dist: 'dist/'
};


const assets = {
    js: paths.src + 'js',
    css: paths.src + 'css',
    scss: paths.src + 'scss',
    components: paths.src + 'scss/components',
    img: paths.src + 'img',
    sprites: paths.src + 'sprites',
    fonts: paths.src + 'fonts',
    inc: paths.src + 'inc',
    html: paths.src + 'html',
    css_img_path: '../img'
};

const distAssets = {
    js: paths.dist + 'js',
    css: paths.dist + 'css',
    img: paths.dist + 'img',
    sprites: paths.dist + 'sprites',
    fonts: paths.dist + 'fonts'
};

/*
 * Tasks
 * 1/ sass
 * 2/ scripts
 * 3/ images
 * 4/ sprites
 * 5/ extend
 * 6/ fonts
 * 7/ delivery
 * 8/ acessibility check
 * 9/ browsersync
 * 10/ watch
 * 
 */

/* remove print css from concatenation + Concatenate & Minify CSS */
function css() {
    const filterPrint = gulpFilter(['**', '!' + assets.scss + '/print.scss'], { 'restore': true });

    const all = gulp.src([assets.scss + '/screen.scss',
        assets.scss + '/**/*.scss',
        assets.scss + '/*.scss'])
            .pipe(plumber())
            .pipe(filterPrint)
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.init())
            .pipe(concat('all.css'))
            .pipe(gulp.dest(assets.css))
            .pipe(gulp.dest(distAssets.css))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(assets.css))
            .pipe(gulp.dest(distAssets.css))
            .pipe(browsersync.stream());

    const print = gulp.src(assets.scss + '/print.scss')
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(assets.css))
            .pipe(gulp.dest(distAssets.css))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(assets.css))
            .pipe(gulp.dest(distAssets.css));

    return all, print;
};

/* Concatenate & Minify JS */
function scripts() {
    return gulp.src([assets.js + '/src/lib/*.js',
                    assets.js + '/src/functions/**/*.js',
                    assets.js + '/src/*.js']) //manage order
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(concat('scripts.js'))
            .pipe(gulp.dest(assets.js))
            .pipe(gulp.dest(distAssets.js))
            .pipe(rename({suffix: '.min'}))
            .pipe(terser({
                ecma: 5,
                safari10: true,
                keep_fnames: false,
                mangle: false,
                compress: {
                    defaults: false
                }
             }))
            .pipe(sourcemaps.write('/'))
            .pipe(gulp.dest(assets.js))
            .pipe(gulp.dest(distAssets.js))
            .pipe(browsersync.stream());
};


/* Optimize images */
function images() {
	
    return gulp.src([assets.img + '/**/*'])
		
        .pipe(newer(assets.img + '/**/*')) //parse only new or updated files
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            })
        ]))

        .pipe(gulp.dest(distAssets.img));
};

/* sprites management 
 * generate svg file for inline use
 */

function sprites() {

	return gulp.src([assets.sprites + '/**/*.svg'])
        .pipe(plumber())
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgSymbols({
                svgAttrs:{
                    class:`hidden`
                }
            }
        ))
        .pipe(gulpIf( /[.]svg$/, gulp.dest(assets.img + '/global')))
        .pipe(gulpIf( /[.]svg$/, gulp.dest(distAssets.img + '/global')))
        .pipe(gulpIf( /[.]css$/, gulp.dest(assets.components)));	
};

/* rename generated css file for sprites */
function renameSprites() {
   return gulp.src([assets.components + '/*.css'])
    .pipe(plumber())
    .pipe(rename({
        basename: '_sprites',
        extname: '.scss'
    }))
    .pipe(gulp.dest(assets.components))
};

/* clean css generated file for sprites */
function cleanSprites() {
    return del([assets.components + '/*.css'], {force: true});
}

/* include html patterns in main files */
function includeHTML() {
  return gulp.src([assets.html + '/*.html'])
    .pipe(plumber())
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.dist))
	.pipe(browsersync.stream());
};

/* include fonts in dist */
function fonts() {
    return gulp.src([assets.fonts + '/**/*'])
        .pipe(plumber())
        .pipe(gulp.dest(distAssets.fonts));
};


/* Create an archive with the current date containing all files needed
 * we exlude unecessary files for the customer like scss and sprite source
 */
function zipDelivery() {
    var date = new Date().toLocaleDateString().replace(/[^0-9]/g, '');
    return gulp.src(['*.html',
        assets.css + '/**',
        assets.img + '/**',
        assets.js + '/**'], {base: "."})
        .pipe(plumber())
        .pipe(zip('delivery-' + date + '.zip'))
        .pipe(gulp.dest(paths.dist));
};


/* accessibility task */
function axeCheck(done) {
    var options = {
        saveOutputIn: 'a11yResult.json',
        browser: 'phantomjs',
        urls: ['*.html']
    };
    return axeA11y(options, done);
};

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: paths.dist
        }
    });
    done();
}

/* watch */
function watchFiles() {
    gulp.watch(assets.scss + '/**/*.scss', css);
    gulp.watch(assets.js + '/src/**/*.js', scripts);
    gulp.watch(assets.img + '/**/*', images);
    gulp.watch(assets.sprites + '/**', gulp.series(sprites, renameSprites, cleanSprites));
    gulp.watch([assets.html + '/*.html', assets.inc + '/**/*.html'], includeHTML);  
}
   
/* chained tasks */
const spritesBuild = gulp.series(sprites, renameSprites, cleanSprites);
const build = gulp.parallel(css, scripts, images, fonts, includeHTML, spritesBuild);
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.scripts = scripts;
exports.spritesBuild = spritesBuild;

exports.build = build;
exports.delivery = zipDelivery;
exports.a11y = axeCheck;
exports.default = watch;