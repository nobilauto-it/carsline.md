const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const includeHTML = require('gulp-file-include');
const beautify = require('gulp-html-beautify');
const browserSync = require('browser-sync').create();
const once = require('gulp-once');

// Include HTML files
function includeHtml() {
    return gulp
        .src(['src/views/pages/*.html'])
        .pipe(
            includeHTML({
                prefix: '@@',
                basepath: '@file',
            }),
        )
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}

// Beautify HTML
function beautifyHtml() {
    return gulp
        .src('dist/**/*.html')
        .pipe(beautify({ indent_size: 4 }))
        .pipe(gulp.dest('dist'));
}

// Copy other resource files
function copyAssets() {
    return gulp
        .src(
            [
                'src/assets/css/**/*',
                'src/assets/fonts/**/*',
                'src/assets/images/**/*',
                'src/assets/imgs/**/*',
                'src/assets/img/**/*',
                'src/assets/js/**/*',
            ],
            { base: 'src/assets' },
        )
        .pipe(gulp.dest('dist/assets'));
}

// Copy backend JS (locale, cars_loader, main) into dist so build includes translations and API loader
function copyBackendAssets() {
    return gulp
        .src(
            [
                '../backend/assets/js/locale.js',
                '../backend/assets/js/cars_loader.js',
                '../backend/assets/js/main.js',
            ],
            { base: '../backend/assets/js' },
        )
        .pipe(gulp.dest('dist/assets/js'));
}

// Copy other resource files (changed only)
function copyAssetsChanged() {
    return gulp
        .src(
            [
                'src/assets/css/**/*',
                'src/assets/fonts/**/*',
                'src/assets/images/**/*',
                'src/assets/imgs/**/*',
                'src/assets/img/**/*',
                'src/assets/js/**/*'
            ],
            { base: 'src/assets' }
        )
        .pipe(once())
        .pipe(gulp.dest('dist/assets'))
        .pipe(browserSync.stream());
}

// Sass
function buildStyles() {
    return gulp
        .src('src/assets/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('src/assets/css/'));
}

// Build task: frontend assets first, then backend JS (overwrites main.js, adds locale.js + cars_loader.js)
gulp.task('build', gulp.series(includeHtml, beautifyHtml, buildStyles, copyAssets, copyBackendAssets));

// Initialize BrowserSync and track changes
gulp.task(
    'dev',
    gulp.series('build', function () {
        // Watch tasks
        gulp.watch('src/views/**/*.html', gulp.series(includeHtml));
        gulp.watch('src/assets/scss/**/**/*', gulp.series(buildStyles));
        gulp.watch(
            [
                'src/assets/css/**/*',
                'src/assets/fonts/**/*',
                'src/assets/images/**/*',
                'src/assets/imgs/**/*',
                'src/assets/img/**/*',
                'src/assets/js/**/*'
            ],
            copyAssetsChanged
        );
        gulp.watch('../backend/assets/js/locale.js', copyBackendAssets);
        gulp.watch('../backend/assets/js/cars_loader.js', copyBackendAssets);
        gulp.watch('../backend/assets/js/main.js', copyBackendAssets);

        browserSync.init({
            server: {
                baseDir: 'dist',
            },
            hot: true,
            // 🔴 Отключаем зеркалирование скролла/кликов/форм между вкладками
            ghostMode: false,
            // (опционально) не открывать окно браузера и убрать уведомления:
            // open: false,
            // notify: false,
        });
    }),
);

// Default action
gulp.task('default', gulp.series('dev'));
