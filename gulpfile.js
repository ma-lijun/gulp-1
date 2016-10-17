/*** Created by Doveaz on 2016/9/24.  https://github.com/DoveAz/gulp5811 */

const root = "",                //项目目录

    build = root + 'build/',       //开发目录
    src = root + 'www/',           //源文件

    serverRoot = build,            //服务器根目录
    serverPort = '800',             //服务器端口
    serverIndex = "noindex.html",  //服务器默认打开页面（为了显示页面列表，设置noindex.html）
    serverHost = 'localhost';      //服务器地址

const sprite = false,                //是否合并雪碧图
    babelStatus = false,           //是否使用babel编译js
    cssminify = true;              //css压缩

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

//静态文件
const assetGlobs = {
    html: [asset.html + '*.html', asset.html + 'template/*.html'],
    js: asset.js + '/*.js',
    css: asset.css + '*.css',
    less: asset.less + '*.less',
    images: asset.images + "**/*.{png,jpg,gif}",
    fonts: asset.fonts + "**/*"
};

// 模块调用
const gulp = require('gulp'),
    open = require("open"),
    contact = require("gulp-concat"),
    gulpSequence = require('gulp-sequence'),
    gulpif = require('gulp-if'),
    cssnano = require('gulp-cssnano'),
    gcmq = require('gulp-group-css-media-queries'),
    del = require('del'),
    minify = require('gulp-minify'),
    ejs = require('gulp-ejs'),
    dest = require('gulp-dest'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    replace = require('gulp-replace'),
    autoprefixer = require('gulp-autoprefixer'),
    postcss = require('gulp-postcss'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    babel=require('gulp-babel'),
    cssgrace = require('cssgrace');

//默认任务
gulp.task('default', gulpSequence(['watch', 'ejs', 'js', 'css', 'images', 'fonts', 'connect'],['contact-less'], 'open'));

gulp.task('doyo', gulpSequence(['del'],[ 'doyo-html', 'contact-less', 'js', 'css', 'images', 'fonts'],'contact-less'));
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

gulp.task('open', function () {
    open("http://localhost:" + serverPort.toString());
});

//监视文件
gulp.task('watch', function () {
    gulp.watch(assetGlobs.html, ['ejs']);
    gulp.watch(assetGlobs.less, ['less', 'contact-less']);
    gulp.watch(assetGlobs.css, ['css']);
    gulp.watch(assetGlobs.images, ['images']);
    gulp.watch(assetGlobs.js, ['js']);
    gulp.watch(assetGlobs.fonts, ['fonts'])
});

//编译ejs
gulp.task('ejs', function () {
    var Reg = /{{\s*([^\s]*)\s*}}/g;
    return gulp.src(assetGlobs.html, {base: asset.html})
        .pipe(plumber({errorHandler: notify.onError("ejs编译失败，请检查代码,模板不存在或语法错误")}))
        .pipe(replace(Reg, "<%- include('template/$1.html') -%>"))
        .pipe(ejs({
            msg: "Hello Gulp!"
        }))
        .pipe(gulp.dest(build))
        .pipe(connect.reload())
});

//编译less
gulp.task('less', function () {
    var processors = [
        require('cssgrace')
    ];
    return gulp.src(assetGlobs.less, {base: asset.less})
        .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 10 versions', 'IE 6-10', '>1%']
        }))
        // .pipe(postcss(processors))
        .pipe(gulp.dest(buildDir.css))
        .pipe(connect.reload())
});

gulp.task('contact-less', function () {
    var processors = [
        require('cssgrace')
    ];
    return gulp.src(assetGlobs.less)
        .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
        .pipe(contact('style.less'))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 10 versions', 'IE 6-10', '>1%']
        }))
        // .pipe(postcss(processors))
        .pipe(gcmq())
        .pipe(gulpif(cssminify, cssnano({
            core: !1,
            discardComments:'!1'
        })))
        .pipe(gulp.dest(build+'css'))
        .pipe(connect.reload())
});

//复制静态文件到build目录
gulp.task('images', function () {
    return gulp.src(assetGlobs.images)
        .pipe(gulp.dest(buildDir.images))
});

gulp.task('fonts', function () {
    return gulp.src(assetGlobs.fonts, {base: asset.fonts})
        .pipe(gulp.dest(buildDir.fonts))
});

gulp.task('css', function () {
    return gulp.src(assetGlobs.css)
        .pipe(gulp.dest(buildDir.css))
        .pipe(connect.reload())
});

gulp.task('js', function () {
    return gulp.src(assetGlobs.js)
        .pipe(gulpif(babelStatus, babel({
            presets: ['es2015']
        })))
        .pipe(gulp.dest(buildDir.js))
});

//清理template文件
gulp.task('clean', function () {
    return del([
        build + 'template/',
        buildDir.css + '/less/'
    ]);
});

gulp.task('del',function(){
    return del([
        build
    ])
});

gulp.task('justwatch', function () {
    connect.server({
        port: serverPort,
        host: serverHost,
        root: src,
        livereload: true,
        index: serverIndex
    });
    gulp.watch(assetGlobs.html, function () {
        gulp.src(assetGlobs.html)
            .pipe(connect.reload())
    });
    gulp.watch(assetGlobs.less, function () {
        var processors = [
            require('cssgrace')
        ];
        gulp.src(assetGlobs.less)
            .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
            .pipe(less())
            .pipe(postcss(processors))
            .pipe(gulp.dest(src + 'css'))
            .pipe(connect.reload())
    });
    gulp.watch(assetGlobs.css, function () {
        gulp.src(assetGlobs.css)
            .pipe(connect.reload())
    });
    gulp.watch(assetGlobs.js, function () {
        gulp.src(assetGlobs.js)
            .pipe(connect.reload())
    });
    open("http://localhost:" + serverPort.toString());
});

gulp.task('doyo-html',function(){
    var Reg = /{{\s*([^\s]*)\s*}}/g;
    var removeDir=/template\//g;
    var doyoReg = /\<\%\-\s+include\(\'(.*)\'\)\s+\-?\%\>/g;
    return gulp.src(assetGlobs.html)
        .pipe(plumber({errorHandler:notify.onError('ejs编译失败，模板不存在或语法错误')}))
        .pipe(replace(Reg,"<%- include('template/$1.html') -%>"))
        .pipe(replace(removeDir,''))
        .pipe(replace(doyoReg,'{include="$1"}'))
        .pipe(gulp.dest(build))
});