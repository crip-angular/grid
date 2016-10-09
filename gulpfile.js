var gulp = require('gulp');
var cripweb = require('cripweb');
var templateCache = require('gulp-angular-templatecache');

gulp.task('angular-templates', function () {
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

cripweb(gulp)(function (crip) {
    crip.config.set('scripts', { base: 'resources', output: 'build' });

    crip.scripts('crip-grid', ['**/*.module.js', '**/*.js'], true)
        .watch('angular-templates', './resources/templates/**/*.html', ['angular-templates']);
});