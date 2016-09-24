/*** Created by Doveaz on 2016/9/24.*/


var root = "test/",                //项目目录

    www = root + 'www/',           //源文件
    dist = root + 'dist/',         //生产目录
    doyo = root + 'doyo/',         //发布适合doyo的文件

    serverRoot = dist,             //服务器根目录
    serverPort = '80',             //服务器端口
    serverHost = 'localhost';      //服务器地址

//生产目录文件夹
var distDir = {
    css: dist + 'css',
    images: dist + 'images'
};

//静态文件目录
var assetDir = {
    html: www,
    js: www + 'js/',
    css: www + 'css/',
    less: www + 'css/',
    images: www + "images/"
};

//静态文件
var asset = {
    html: [assetDir.html + '*.html', assetDir.html + 'template/*.html'],
    js: assetDir.js + '/*.js',
    css: assetDir.css + '*.css',
    less: assetDir.less + '**/*.less',
    images: assetDir.images + "**/*.{png,jpg,gif}"
};


var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    ejs = require('gulp-ejs'),
    dest = require('gulp-dest'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    postcss = require('gulp-postcss'),
    spriter = require('gulp-css-spriter'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    through = require('through2'),
    cssgrace = require('cssgrace');

//默认任务
gulp.task('default', ['watch', 'ejs', 'less', 'css', 'connect']);

//发布 会清理html和css模板文件
gulp.task('dist', ['default', 'clean']);

//发布适合doyo cms使用的文件 会替换include标签 并清理 css模板文件
gulp.task('doyo', ['default']);

//服务器配置
gulp.task('connect', function () {
    connect.server({
        port: serverPort,
        host: serverHost,
        root: serverRoot,
        livereload: true
    })
});

//监视文件
gulp.task('watch', function () {
    gulp.watch(asset.html, ['ejs']);
    gulp.watch(asset.less, ['less']);
    gulp.watch(asset.css, ['css'])
});

//编译ejs
gulp.task('ejs', function () {
    gulp.src(asset.html, {base: assetDir.html})
        .pipe(plumber({errorHandler: notify.onError("ejs编译失败，请检查代码")}))
        .pipe(ejs({
            msg: "Hello Gulp!"
        }))
        .pipe(gulp.dest(dist))
        .pipe(connect.reload())
});

//编译less
gulp.task('less', function () {
    var processors = [
        require('cssgrace')
    ];
    gulp.src(asset.less, {base: assetDir.less})
        .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 5 versions', 'IE 6-8', '>2%']
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(distDir.css))
        .pipe(connect.reload())
});

//发布静态文件到dist目录
gulp.task('images', function () {
    gulp.src(asset.images)
        .pipe(gulp.dest(distDir.images))

});
gulp.task('css', function () {
    gulp.watch(asset.css, function () {
        gulp.src(asset.css)
            .pipe(gulp.dest(distDir.css))
            .pipe(connect.reload())
    })
});