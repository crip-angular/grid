var gulp = require('gulp'),
    crip = require('cripweb'),
    templateCache = require('gulp-angular-templatecache');

gulp.task('watch-angular-templates', function () {
    return gulp.src('resources/templates/**/*.html')
        .pipe(templateCache('templates.js', {
            module: 'crip.grid.templates',
            standalone: true,
            base: function (file) {
                return '/crip/grid/' + file.path.replace(file.base, '')
            }
        }))
        .pipe(gulp.dest('resources/templates'));
});

crip.scripts([
        '**/*.module.js',
        '**/*.js'
    ],
    'crip-grid',
    'scripts',
    'resources',
    'build');

crip.addWatch(
    './resources/templates/**/*.html',
    'watch-angular-templates',
    gulp
);

gulp.task('default', function () {
    crip.gulp.start('crip-default');
    crip.watch();
});