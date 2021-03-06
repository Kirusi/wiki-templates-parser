// grab our gulp packages
const gulp = require('gulp');
const { execSync } = require('child_process');
const PluginError = require('plugin-error');
const del = require('del');

function runCmd(taskName, cmd) {
    try {
        execSync(cmd, {stdio: [0, 1, 2]});
    }
    catch (error) {
        throw new PluginError({
            plugin: taskName,
            message: error.message
        });
    }
}

gulp.task('clean', function(done) {
    del.sync(['./build', './generated', './docs']);
    done();
});

gulp.task('eslint', function eslintTask(done) {
    runCmd('eslint', 'npm run eslint-fix');
    done();
});

gulp.task('dev-test', gulp.series('eslint', function devTestTask(done) {
    runCmd('dev-test', 'npm run dev-test');
    done();
}));

gulp.task('esdoc', gulp.series('dev-test', function esdocTask(done) {
    runCmd('esdoc', 'npm run esdoc');
    done();
}));

gulp.task('generate', gulp.series('esdoc', function generateTask(done) {
    runCmd('generate', 'npm run generate');
    done();
}));

gulp.task('gen-test', gulp.series('generate', function generateTask(done) {
    runCmd('gen-test', 'npm run gen-test');
    done();
}));

gulp.task('webpack', gulp.series('gen-test', function webpackTask(done) {
    runCmd('webpack', 'npm run webpack');
    done();
}));

gulp.task('prod-test', gulp.series('webpack', function prodTestTask(done) {
    runCmd('prod-test', 'npm run prod-test');
    done();
}));

gulp.task('analyze-tests', gulp.series('prod-test', function devTestTask(done) {
    runCmd('analyze-tests', 'npm run analyze-tests');
    done();
}));

gulp.task('web-test', gulp.series('analyze-tests', function prodTestTask(done) {
    runCmd('web-test', 'npm run web-test');
    done();
}));

gulp.task('build', gulp.series('web-test', function buildTask(done) {
    done();
}));

gulp.task('watch', function watchTask(done) {
    gulp.watch(['src/**/*.js', 'test/**/*.js', 'gulpfile.js', 'package.json'], gulp.series('build'));
    done();
});

gulp.task('default', gulp.series('build', 'watch', function defaultTask(done) {
    done();
}));
