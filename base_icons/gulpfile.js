/* plugins */
var gulp = require('gulp'),
        axe = require('gulp-axe-webdriver'),
		plumber = require('gulp-plumber'),
        shell = require('gulp-shell'),
        browsersync = require('browser-sync'),
        sass = require('gulp-sass'),
        cleanCSS = require('gulp-clean-css'),
        sourcemaps = require('gulp-sourcemaps'),
        uglify = require('gulp-uglify'),
        imagemin = require('gulp-imagemin'),
        rename = require('gulp-rename'),
        concat = require('gulp-concat'),
        notify = require('gulp-notify'),
        cache = require('gulp-cache'),
        gulpFilter = require('gulp-filter'),
        merge = require('merge-stream'),
        zip = require('gulp-zip'),
        fileinclude = require('gulp-file-include'),
        iconfont = require('gulp-iconfont');

/* paths */

var paths = {
    src: 'site/',
    dist: 'dist/',
    styleguide: 'styleguide/src/assets/toolkit/'
};

var assets = {
    js: paths.src + 'js',
    css: paths.src + 'css',
    scss: paths.src + 'scss',
    img: paths.src + 'img',
    inc: paths.src + 'inc',
    html: paths.src + 'html',
    icon_font: paths.src + 'icon_font',
    tpl: paths.src + 'tpl',
    styleguide_css: paths.styleguide + 'styles',
    styleguide_js: paths.styleguide + 'scripts'
};

// name of your icon font
var myFont = '';

// url of your project
var urlSync = 'test.local';

/*
 * Tasks
 * 1/ compass
 * 2/ scripts
 * 3/ images
 * 4/ icon font
 * 5/ extend
 * 6/ styleguide
 * 7/ zip
 * 8/ watch
 * 9/ accessibility check
 */

/* remove print css from concatenation + Concatenate & Minify CSS */
gulp.task('sass', function () {
    var filterPrint = gulpFilter(['*', '!print.scss']);

    var all = gulp.src([assets.scss + '/screen.scss',
        assets.scss + '/**/*.scss',
        assets.scss + '/*.scss'])
            .pipe(plumber())
            .pipe(filterPrint)
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.init())
			.pipe(concat('toolkit.scss'))
            .pipe(gulp.dest(assets.styleguide_css))
            .pipe(notify({message: 'toolkit.scss generated', onLast: true}))
            .pipe(rename('all.css'))
            .pipe(gulp.dest(assets.css))
            .pipe(notify({message: 'all.css generated', onLast: true}))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(assets.css))
            .pipe(browsersync.reload({stream: true}))
            .pipe(notify({message: 'all.min.css generated', onLast: true}))

    var print = gulp.src(assets.scss + '/print.scss')
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(assets.css))
            .pipe(notify({message: 'print.css generated', onLast: true}))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(assets.css))
            .pipe(notify({message: 'print.min.css generated', onLast: true}));

    return all, print;
});

/* Concatenate & Minify JS */
gulp.task('scripts', function () {
    return gulp.src([assets.js + '/src/lib/*.js', assets.js + '/src/*.js']) //manage order
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(concat('toolkit.js')) //for fabricator
            .pipe(gulp.dest(assets.styleguide_js))
            .pipe(notify({message: 'toolkit.js generated', onLast: true}))
            .pipe(rename('scripts.js'))
            .pipe(gulp.dest(assets.js))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(sourcemaps.write('/'))
            .pipe(gulp.dest(assets.js))
            .pipe(browsersync.reload({stream: true}))
            .pipe(notify({message: 'Scripts task complete', onLast: true}));
});

//usefull for Drupal projects that already include jquery, list all the scripts to exclude here
gulp.task('scripts_light', function () {
    var filterJS = gulpFilter(['**', '!jquery.min.js']);
    return gulp.src([assets.js + '/src/lib/*.js', assets.js + '/src/*.js']) //manage order
            .pipe(plumber())
            .pipe(filterJS)
            .pipe(sourcemaps.init())
            .pipe(concat('all.js')) //for fabricator
            .pipe(gulp.dest(assets.js))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(sourcemaps.write('/'))
            .pipe(gulp.dest(assets.js))
            .pipe(browsersync.reload({stream: true}))
            .pipe(notify({message: 'Scripts light task complete', onLast: true}));
});

/* Optimise images */
gulp.task('images', function () {
    return gulp.src(assets.img + '/**/*')
            .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
            .pipe(gulp.dest(assets.img));
});

/* create font with svg icons */
var runTimestamp = Math.round(Date.now() / 1000);
gulp.task('iconfont', function () {
    return gulp.src([assets.icon_font + '/*.svg'])
            .pipe(iconfont({
                fontName: 'myFont',
                prependUnicode: true,
                normalize: true,
                fontHeight: 16,
                formats: ['eot', 'woff2'],
                timestamp: runTimestamp
            }))
            .on('glyphs', function (glyphs, options) {
                // CSS templating, e.g.
                console.log(glyphs, options);
            })
            .pipe(gulp.dest(assets.css + '/font/'));
});

/* include html patterns in main files */
gulp.task('fileinclude', function() {
  gulp.src([assets.html + '/*.html'])
    .pipe(plumber())
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./'))
	.pipe(browsersync.reload({stream: true}));
});

/* get Fabricator and put it in styleguide folder */
gulp.task('styleguide', shell.task([
    'curl -o styleguide/temp.tar.gz -L https://github.com/fbrctr/fabricator/archive/master.tar.gz',
    'tar -xzvf  styleguide/temp.tar.gz -C styleguide --strip 1',
    'rm -rf styleguide/temp.tar.gz'
]));

/* Create an archive with the current date containing all files needed
 * we exlude unecessary files for the customer like scss and sprite source
 */
gulp.task('zipDelivery', function () {
    var date = new Date().toLocaleDateString().replace(/[^0-9]/g, '');
    return gulp.src(['*.html',
        assets.css + '/**',
        assets.img + '/**',
        assets.js + '/**'], {base: "."})

            .pipe(zip('delivery' + date + '.zip'))
            .pipe(gulp.dest(paths.dist))
            .pipe(notify({message: 'Archive generated'}));
});

/* browsersync */
gulp.task('browser-sync', function () {
    browsersync.init({
        proxy: urlSync,
        port: 3000
    });
});

gulp.task('browsersync-reload', function () {
    browsersync.reload();
});

// Watch Files For Changes
gulp.task('watch', ['browser-sync'], function () {
    gulp.watch(assets.scss + '/**/*.scss', ['sass']);
    gulp.watch(assets.js + '/src/**/*.js', ['scripts', 'scripts_light']);
    gulp.watch(assets.img + '/**/*', ['images']);
    gulp.watch(assets.sprites + '/**', ['sprites']);
    gulp.watch([assets.html + '/*.html', assets.inc + '/*.html'], ['fileinclude']);
});

/* accessibility task */
gulp.task('axe', function(done) {
  var options = {
    saveOutputIn: 'a11yResult.json',
    browser: 'phantomjs',
    urls: ['*.html']
  };
  return axe(options, done);
});

// Default Task
gulp.task('default', ['watch']);
gulp.task('delivery', ['zipDelivery']);