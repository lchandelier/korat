/* plugins */
var   axe = require('gulp-axe-webdriver'),
		browsersync = require('browser-sync'),
		cache = require('gulp-cache'),
		changed = require('gulp-changed'),
		cheerio = require('gulp-cheerio'),
        cleanCSS = require('gulp-clean-css'),
        clone = require('gulp-clone'),
        concat = require('gulp-concat'),
		del	= require('del'),
        fileinclude = require('gulp-file-include'),
        gulp = require('gulp'),
		gulpFilter = require('gulp-filter'),
		gulpIf = require('gulp-if'),
		imagemin = require('gulp-imagemin'),
		merge = require('merge-stream'),
		notify = require('gulp-notify'),
        plumber = require('gulp-plumber'),
		rename = require('gulp-rename'),
		sass = require('gulp-sass'),
        shell = require('gulp-shell'),
        svgSymbols = require('gulp-svg-symbols'),
        sourcemaps = require('gulp-sourcemaps'),
        uglify = require('gulp-uglify'),
		webp = require('gulp-webp'),
        zip = require('gulp-zip');
        

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
    components: paths.src + 'scss/components',
    img: paths.src + 'img',
    sprites: paths.src + 'sprites',
    inc: paths.src + 'inc',
    html: paths.src + 'html',
    tpl: paths.src + 'tpl',
    css_img_path: '../img',
    styleguide_css: paths.styleguide + 'styles',
    styleguide_js: paths.styleguide + 'scripts'
};

// url of your project
var urlSync = 'test.local';

/*
 * Tasks
 * 1/ sass
 * 2/ scripts
 * 3/ images
 * 4/ sprites
 * 5/ extend
 * 6/ styleguide
 * 7/ zip
 * 8/ watch
 * 9/ accessibility check
 * 
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
            .pipe(notify({message: 'toolkit.scss generated'}))
            .pipe(rename('all.css'))
            .pipe(gulp.dest(assets.css))
            .pipe(notify({message: 'all.css generated', onLast: true}))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(assets.css))
            .pipe(browsersync.reload({stream: true}))
            .pipe(notify({message: 'all.min.css generated', onLast: true}));

    var print = gulp.src(assets.scss + '/print.scss')
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(assets.css))
            .pipe(notify({message: 'print.css generated', onLast: true}))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(assets.css))
            .pipe(browsersync.reload({stream:true}))
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

//usefull for Drupal/WordPress projects that already include jquery, list all the scripts to exclude here
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

/* Optimize images */
gulp.task('images', function () {
    var cloneSink = clone.sink();
	
    return gulp.src([assets.img + '/**/*', '!' + assets.img + '/**/*.webp'])
            .pipe(plumber())
			
            .pipe(changed(assets.img + '/**/*')) //parse only new or updated files
            .pipe(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.jpegtran({progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: false},
                        {cleanupIDs: false}
                    ]
                })
            ]))

			.pipe(cloneSink)   // clone image
			.pipe(webp())      // convert cloned image to WebP
            .pipe(cloneSink.tap()) 
            .pipe(gulp.dest(assets.img));
});

/* sprites management 
 * generate svg file for inline use
 */

gulp.task('sprites', function () {
	return gulp.src([assets.sprites + '/**/*.svg'])
        .pipe(plumber())
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgSymbols(
            {
                title: '%f',
                svgClassname: 'a11y_hidden',
                fontSize: 10
            }
        ))
        .pipe(gulpIf( /[.]svg$/, gulp.dest(assets.img + '/global')))
        .pipe(gulpIf( /[.]css$/, gulp.dest(assets.components)))	
		.pipe(notify({message: 'Sprite generated', onLast: true}));
});

/* rename generated css file for sprites */

gulp.task('rename-sprites', ['sprites'], function() {
   return gulp.src([assets.components + '/*.css'])
    .pipe(plumber())
    .pipe(rename({
        basename: '_sprites',
        extname: '.scss'
    }))
    .pipe(gulp.dest(assets.components))
});

/* delete the useless css file */
gulp.task('clean-sprites', ['rename-sprites'], function() {    
    return del([assets.components + '/*.css'], {force: true})
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
        .pipe(plumber())
        .pipe(zip('delivery-' + date + '.zip'))
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
    gulp.watch(assets.sprites + '/**', ['clean-sprites']);
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