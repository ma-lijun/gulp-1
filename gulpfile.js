/*** Created by Doveaz on 2016/9/24.  https://github.com/DoveAz/gulp*/

const
    root = "",                //项目目录
    build = root + 'build/',       //开发目录
    src = root + 'www/',           //源文件

    serverRoot = build,            //服务器根目录
    serverPort = '800',             //服务器端口
    serverIndex = "noindex.html",  //服务器默认打开页面（为了显示页面列表，设置noindex.html）
    serverHost = 'localhost';      //服务器地址

const cssminify = true;              //css压缩

//开发目录文件夹
const buildDir = {
    css: build + 'css',
    images: build + 'images',
    js: build + 'js',
    fonts: build + 'fonts'
};

//静态文件目录
const asset = {
    html: src,
    js: src + 'js/',
    css: src + 'css/',
    less: src + 'less/',
    images: src + "images/",
    fonts: src + "fonts/"
};

// 模块调用
const gulp = require('gulp'),
    os = require('os'),
    ip=require('ip'),
    open = require("open"),
    contact = require("gulp-concat"),
    gulpSequence = require('gulp-sequence'),
    gulpif = require('gulp-if'),
    changed = require('gulp-changed'),
    cssnano = require('gulp-cssnano'),
    gcmq = require('gulp-group-css-media-queries'),
    del = require('del'),
    dest = require('gulp-dest'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    replace = require('gulp-replace'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps=require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    te=require('gulp-te'),
    watch=require('gulp-watch'),
    notify = require('gulp-notify');

//默认任务
gulp.task('default', gulpSequence(['watch', 'te', 'js', 'css','css-less', 'images', 'fonts', 'connect'], 'contact', 'open','ip'));

gulp.task('dev', gulpSequence(['watch-dev', 'te', 'js', 'css', 'css-less','images', 'fonts', 'connect'], 'contact-dev', 'open','ip'));

gulp.task('doyo', gulpSequence(['del'], ['doyo-html','copy-template','css-less', 'js', 'css', 'images', 'fonts'], 'contact','ip'));

gulp.task('test', gulpSequence(['watch-dev', 'te', 'js', 'css', 'images','css-less', 'fonts', 'connect'], 'contact-dev','ip'));

//服务器配置
gulp.task('connect', function () {
    connect.server({
        port: serverPort,
        host: serverHost,
        root: serverRoot,
        livereload: true,
        index: serverIndex
    })
});

gulp.task('ip',function(){
    console.log('请在其他设备设备上访问:-----'+ip.address()+':'+serverPort)
});
gulp.task('open', function () {
    open("http://localhost:" + serverPort.toString());
});

//监视文件
gulp.task('watch', function () {
    gulp.watch(asset.css + '**/*', ['css']);
    gulp.watch(asset.js + '/*.js', ['js']);
    gulp.watch(asset.css + '**/*.less', ['css-less']);
});

gulp.task('watch-dev', function () {
    gulp.watch(asset.css + '**/*', ['css']);
    gulp.watch(asset.js + '/*.js', ['js']);
    gulp.watch(asset.css + '**/*.less', ['css-less']);
});

//编译te
gulp.task('te', function () {
    return watch((asset.html + '**/*.html'),function(){
        var Reg = /{{\s*([^\s]*)\s*}}/g;
        gulp.src(asset.html + '/**/*.html', {base: asset.html})
            .pipe(plumber({errorHandler: notify.onError("html模板编译错误 <%= error.message %>")}))
            .pipe(te())
            .pipe(gulp.dest(build))
            .pipe(connect.reload())
    })
});

//编译less
gulp.task('less', function () {
    return gulp.src(asset.less + '*.less')
        .pipe(changed(buildDir.css+'/less'))
        .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
        .pipe(less())
        .pipe(gulp.dest(buildDir.css + '/less'))
        .pipe(connect.reload())
});

gulp.task('css-less',function(){
    return gulp.src(asset.css+'*.less')
        .pipe(changed(buildDir.css+'/less'))
        .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
        .pipe(less())
        .pipe(gulp.dest(buildDir.css ))
        .pipe(connect.reload())
});


gulp.task('contactc', function () {
    return watch((asset.less+'*.less'),function(){
        gulp.src(asset.less+'*.less')
            .pipe(plumber({errorHandler: notify.onError("css合并错误 <%= error.message %>")}))
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(autoprefixer({
                browsers: ['last 3 versions', 'IE 6-10', '>2%']
            }))
            .pipe(contact('all.css'))
            .pipe(gulpif(cssminify, cssnano({
                core: !1,
                discardComments: '!1'
            })))
            .pipe(gcmq())
            .pipe(sourcemaps.write('',{sourceRoot:"./less"}))
            .pipe(gulp.dest(build + 'css/'))
            .pipe(connect.reload())
    })

});

gulp.task('contact', function () {
    gulpSequence('contactc','clean')()
});
gulp.task('contact-dev', ['less','contactc']);



//复制静态文件到build目录
gulp.task('images', function () {
    return  watch((asset.images+ '**/*'),function(){
        gulp.src(asset.images + '**/*', {base: asset.images})
            .pipe(changed(buildDir.images))
            .pipe(gulp.dest(buildDir.images))
    });
});

gulp.task('fonts', function () {
    return watch((asset.fonts + '**/*'),function(){
        gulp.src(asset.fonts + '**/*', {base: asset.fonts})
            .pipe(changed(buildDir.fonts))
            .pipe(gulp.dest(buildDir.fonts))
    })
});

gulp.task('css', function () {
    return gulp.src([asset.css + '**/*','!**/*.less'], {base: asset.css})
        .pipe(changed(buildDir.css))
        .pipe(gulp.dest(buildDir.css))
        .pipe(connect.reload())
});

gulp.task('js', function () {
    return gulp.src(asset.js + '**/*')
        .pipe(changed(buildDir.js))
        .pipe(gulp.dest(buildDir.js))
});

//清理template文件
gulp.task('clean', function () {
    return del([
        build + 'template/',
        buildDir.css + '/less/',
        buildDir.css+'/all.css.map'
    ]);
});

gulp.task('del', function () {
    return del([
        build
    ])
});

gulp.task('copy-template',function(){
    return gulp.src(asset.html+'/template/*.html')
        .pipe(gulp.dest(build+'template/'))
});
gulp.task('doyo-html', function () {
    var Reg = /{{\s*([^\s]*)\s*}}/g;
    var removeDir = /template\//g;
    var doyoReg = /\<\%\-\s+include\(\'(.*)\'\)\s+\-?\%\>/g;
    return gulp.src(asset.html + '*.html')
        .pipe(plumber({errorHandler: notify.onError('替换doyo标签错误 <%= error.message %>')}))
        .pipe(replace(Reg, "<%- include('template/$1.html') -%>"))
        .pipe(replace(removeDir, ''))
        .pipe(replace(doyoReg, '{include="$1"}'))
        .pipe(gulp.dest(build))
});
