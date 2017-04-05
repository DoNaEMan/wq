//npm install gulp-htmlmin gulp-imagemin imagemin-pngcrush gulp-clean-css gulp-uglify gulp-concat gulp-rename gulp-notify gulp-connect gulp-changed --save-dev

var gulp = require('gulp'), //本地安装gulp所用到的地方
    htmlmin = require('gulp-htmlmin'), //html压缩
    imagemin = require('gulp-imagemin'),//图片压缩
    pngcrush = require('imagemin-pngcrush'),
    minifycss = require('gulp-clean-css'),//css压缩
    uglify = require('gulp-uglify'),//js压缩
    concat = require('gulp-concat'),//文件合并
    rename = require('gulp-rename'),//文件更名
    notify = require('gulp-notify'),//提示信息
    connect = require('gulp-connect'),
    cssimport = require("gulp-cssimport"),
    changed = require('gulp-changed');

var srcCss = ['src/css/*.css', 'src/css/**/*.css'],
    srcHtml = ['src/html/*.html'],
    srcJs = ['src/js/*.js', 'src/js/**/*.js'],
    srcImg = ['src/img/*'],
    dist = 'dist',
    srcBase = 'src';


//定义一个testLess任务（自定义任务名称）
/*gulp.task('testLess', function () {
 gulp.src('src/less/!*.less')
 .pipe(less())
 .pipe(gulp.dest('src/css'));
 });*/


// 压缩html
gulp.task('html', function () {
    return gulp.src(srcHtml, {base: srcBase})
        .pipe(changed(dist, {extension: '.html'}))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(dist))
        .pipe(notify({message: 'html task ok'}))
        .pipe(connect.reload());
});

// 压缩图片
gulp.task('img', function () {
    return gulp.src(srcImg, {base: srcBase})
        .pipe(imagemin())
        .pipe(changed(dist))
        .pipe(gulp.dest(dist))
        .pipe(notify({message: 'img task ok'}));
});

// 合并、压缩、重命名css
gulp.task('css', function () {
    return gulp.src(srcCss, {base: srcBase})
    //.pipe(concat('main.css'))
    //.pipe(gulp.dest('dist/css'))
    //.pipe(rename({ suffix: '.min' }))
        .pipe(changed(dist, {extension: '.css'}))
        .pipe(cssimport({}))
        .pipe(minifycss())
        .pipe(gulp.dest(dist))
        .pipe(notify({message: 'css task ok'}))
        .pipe(connect.reload());
});

// 合并、压缩js文件
gulp.task('js', function () {
    return gulp.src(srcJs, {base: srcBase})
    //.pipe(concat('main.js'))
    //.pipe(gulp.dest('dist/js'))
    ///.pipe(rename({ suffix: '.min' }))
        .pipe(changed(dist, {extension: 'js'}))
        .pipe(uglify())
        .pipe(gulp.dest(dist))
        .pipe(notify({message: 'js task ok'}))
        .pipe(connect.reload());
});

gulp.task('connect', function () {
    connect.server({
        livereload: true
    });
});

// 默认任务
gulp.task('default', function () {
    gulp.run('img', 'css', 'js', 'html', 'connect');

    // 监听html文件变化
    gulp.watch(srcHtml, function () {
        gulp.run('html');
    });

    //gulp.watch('src/less/*.less', ['testLess']);

    // Watch .css files
    gulp.watch(srcCss, ['css']);

    // Watch .js files
    gulp.watch(srcJs, ['js']);

    // Watch image files
    gulp.watch(srcImg, ['img']);
});