var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var log = plugins.util.log;
var purify = require('gulp-purifycss');
var config = require('./gulp.config.json');
var stripDebug = require('gulp-strip-debug');
// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------
/**
 * Minify and bundle the JavaScript
 * @return {Stream}
 */
gulp.task('js', ['templatecache'], function() {
    log('Bundling, minifying, and copying the app\'s JavaScript');

    return gulp.src(config.js)
        .pipe(stripDebug())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('all.min.js'))
        .pipe(plugins.ngAnnotate({
            add: true,
            single_quotes: true
        }))
        .pipe(plugins.bytediff.start())
        .pipe(plugins.uglify({
            mangle: true
        }))
        .pipe(plugins.bytediff.stop(bytediffFormatter))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(config.assets));
});

/**
 * Minify and bundle the Vendor JavaScript
 * @return {Stream}
 */
gulp.task('vendorjs', function() {
    log('Bundling, minifying, and copying the Vendor JavaScript');

    return gulp.src(config.vendorjs)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.bytediff.start())
        .pipe(plugins.uglify())
        .pipe(plugins.bytediff.stop(bytediffFormatter))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(config.assets));
});

/**
 * Convert SASS to CSS
 * @return {Stream}
 */
gulp.task('sass', function() {
    log('Converting SASS to CSS');
    return gulp.src(config.src + 'assets/sass/*.scss')
        .pipe(plugins.sass())
        .pipe(gulp.dest(config.src + 'assets/css'))
        .pipe(reload({stream: true}));
});

/**
 * Minify and bundle the CSS
 * @return {Stream}
 */
gulp.task('css', ['sass'], function() {
    log('Bundling, minifying, and copying the app\'s CSS');

    var vendorsjs = config.vendorjs;
    var appjs = vendorsjs.concat(config.js);
    var filesToPurify = appjs.concat(config.html);

    log('Files to Purify:', filesToPurify);

    return gulp.src(config.src + 'assets/css/*.css')
        //.pipe(plugins.sourcemaps.init())
        .pipe(plugins.bytediff.start())
        //Problem with directives csslog(filesToPurify)
        .pipe(purify(filesToPurify))
        .pipe(plugins.csso())
        .pipe(plugins.concat('all.min.css'))
        .pipe(plugins.bytediff.stop(bytediffFormatter))
        //.pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(config.assets + 'css/'));
});

/**
 * Minify and bundle the Vendor CSS
 * @return {Stream}
 */
gulp.task('vendorcss', function() {
    log('Compressing, bundling, copying vendor CSS');
    var vendorFilter = plugins.filter(['**/*.css']);

    return gulp.src(config.vendorcss)
        .pipe(vendorFilter)
        .pipe(plugins.concat('vendor.min.css'))
        .pipe(plugins.bytediff.start())
        .pipe(plugins.csso())
        .pipe(plugins.bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(config.assets + 'css/'));
});

/**
 *  Concatenates and registers AngularJS templates in the $templateCache.
 *  @return {Stream}
 */
gulp.task('templatecache', function() {
    log('Creating an AngularJS $templateCache');

    return gulp.src('./src/app/**/*.html')
        .pipe(plugins.bytediff.start())
        .pipe(plugins.minifyHtml({
            empty: true
        }))
        .pipe(plugins.bytediff.stop(bytediffFormatter))
        .pipe(plugins.angularTemplatecache('templates.js',
            {
                module: 'app.core',
                root: 'app/',
                standAlone: false
            }
        ))
        .pipe(gulp.dest(config.assets));
});

/**
 *  Copy all necessary files which don't need extra processing
 */
gulp.task('copy:misc', function() {
    return gulp.src([

        // Copy all files
        './LICENSE.md',
        config.src + '**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + config.src + '{app,app/**}',
        '!' + config.src + '{assets,assets/**}',
        '!' + config.src + '{vendor,vendor/**}',
        '!' + config.src + 'index.html'
    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(config.build));
});

/**
 * Copy .htaccess from npm package
 */
gulp.task('copy:.htaccess', function() {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
        .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
        .pipe(gulp.dest(config.build));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', function() {
    log('Compressing, caching, and copying images');
    console.log(config.images);
    return gulp
        .src(config.images)
        .pipe(plugins.cache(plugins.imagemin({
            optimizationLevel: 3
        })))
        .pipe(gulp.dest(config.assets + 'img'));
});

/**
 * Copy fonts
 */
gulp.task('fonts', function() {
    log('Copying necessary font packs.');
    console.log(config.fonts);
    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.assets + '/fonts'));
});

/**
 *  Revision and injection of js and css in index.html
 */
gulp.task('rev-and-inject', ['js', 'vendorjs', 'css', 'vendorcss'], function() {
    log('Rev\'ing files and building index.html');

    var minified = config.build + '**/*.min.*';
    var index = config.src + 'index.html';
    var minFilter = plugins.filter(['**/*.min.*', '!**/*.map']);
    var indexFilter = plugins.filter('index.html');

    return gulp
        // Write the revisioned files
        .src([].concat(minified, index)) // add all built min files and index.html
        .pipe(minFilter) // filter the stream to minified css and js
        .pipe(plugins.rev()) // create files with rev's
        .pipe(gulp.dest(config.build)) // write the rev files
        .pipe(minFilter.restore()) // remove filter, back to original stream

        // inject the files into index.html
        .pipe(indexFilter) // filter to index.html
        //.pipe(inject('assets/css/vendor.min.css', 'inject-vendor'))
        .pipe(inject('assets/css/all.min.css'))
        .pipe(inject('assets/vendor.min.js', 'inject-vendor'))
        .pipe(inject('assets/all.min.js'))
        .pipe(inject('assets/templates.js', 'inject-templates'))
        .pipe(gulp.dest(config.build)) // write the rev files
        .pipe(indexFilter.restore()) // remove filter, back to original stream

        // replace the files referenced in index.html with the rev'd files
        .pipe(plugins.revReplace()) // Substitute in new filenames
        .pipe(gulp.dest(config.build)) // write the index.html file changes

        .pipe(plugins.rev.manifest()) // create the manifest (must happen last or we screw up the injection)
        .pipe(gulp.dest(config.build)); // write the manifest

    function inject(path, name) {
        var pathGlob = config.build + path;
        var options = {
            ignorePath: config.build,
            read: false,
            addRootSlash: false
        };

        if (name) {
            options.name = name;
        }

        return plugins.inject(gulp.src(pathGlob), options);
    }
});

// ---------------------------------------------------------------------
// | Main tasks
// ---------------------------------------------------------------------
gulp.task('watch', function() {
    var configServer = {
            proxy: config.proxy,
            ghostMode: {
                clicks: true,
                forms: false,
                scroll: true
            },
            logLevel: "debug"
        },
        sass = ['gulpfile.js'].concat(config.sass, config.vendorcss),
        js = ['gulpfile.js'].concat(config.js);

    browserSync(configServer);

    gulp.watch(js).on('change', reload);

    gulp.watch(sass, ['sass']).on('change', reload);

    gulp.watch(config.src + '**/*.html').on('change', reload);
});

/**
 * Run browser-sync and watch files for changes. Default task.
 */
gulp.task('default', ['watch']);
/**
 * Build the optimized app
 */
gulp.task('build', ['rev-and-inject', 'images', 'fonts', 'copy:.htaccess', 'copy:misc'], function() {
    log(plugins.util.colors.green('Building the optimized app'));
});

/**
 * Clean build folder
 */
gulp.task('clean', function(cb) {
    log('Cleaning: ' + plugins.util.colors.blue(config.build));
    plugins.cache.clearAll();
    del(config.build, cb);
});

/**
 * Karma Test
 */
gulp.task('test', function() {
    return gulp.src('./fake')// loaded at karma.config.js
        .pipe(plugins.karma({
            configFile: 'karma.config.js',
            action: 'watch'
        }))
});

// ---------------------------------------------------------------------
// | Helper Functions
// ---------------------------------------------------------------------
/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' + (data.endSize / 1000).toFixed(2) + ' kB' +
        ' and is ' + formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted percentage
 */
function formatPercent(num, precision) {
    return (num * 100).toFixed(precision);
}