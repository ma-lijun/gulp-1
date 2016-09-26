/*** Created by Doveaz on 2016/9/24.  https://github.com/DoveAz/gulp5811 */

var root = "test/",                //项目目录

    www = root + 'www/',           //源文件
    dist = root + 'dist/',         //生产目录
    doyo = root + 'doyo/',         //发布适合doyo的文件

    serverRoot = dist,             //服务器根目录
    serverPort = '80',             //服务器端口
    serverIndex = "noindex.html",    //服务器默认打开页面（为了显示页面列表，设置noindex.html）
    serverHost = 'localhost';      //服务器地址


var imagemin = false,              //是否开启图片压缩
    sprite = false,               //是否合并雪碧图
    cssminify = true;             //css压缩

//生产目录文件夹
var distDir = {
    css: dist + 'css',
    images: dist + 'images',
    js: dist + 'js'
};

var doyoDir = {
    css: doyo + 'css',
    images: doyo + 'images',
    js: doyo + 'js'
};

//静态文件目录
var asset = {
    html: www,
    js: www + 'js/',
    css: www + 'css/',
    less: www + 'css/',
    images: www + "images/"
};

//静态文件
var assetGlobs = {
    html: [asset.html + '*.html', asset.html + 'template/*.html'],
    js: asset.js + '/*.js',
    css: asset.css + '*.css',
    less: asset.less + '**/*.less',
    images: asset.images + "**/*.{png,jpg,gif}"
};

// 模块调用
var gulp = require('gulp'),
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
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'),
    postcss = require('gulp-postcss'),
    spriter = require('gulp-css-spriter'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    through = require('through2'),
    cssgrace = require('cssgrace');

//默认任务
gulp.task('default', ['watch', 'ejs', 'less', 'css', 'images', 'connect']);

//发布 会清理html和css模板文件,并且压缩css，js
gulp.task('dist', ['ejs', 'less', 'css', 'images', 'cleanCss', 'cleanHtml', 'minify']);

//发布适合doyo cms使用的文件 会替换include标签 并清理css模板文件
gulp.task('doyo', ['doyo-build']);

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

//监视文件
gulp.task('watch', function () {
    gulp.watch(assetGlobs.html, ['ejs']);
    gulp.watch(assetGlobs.less, ['less']);
    gulp.watch(assetGlobs.css, ['css']);
    gulp.watch(assetGlobs.images, ['images'])
});

//编译ejs
gulp.task('ejs', function () {
    return gulp.src(assetGlobs.html, {base: asset.html})
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
    return gulp.src(assetGlobs.less, {base: asset.less})
        .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 5 versions', 'IE 6-8', '>1%']
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(distDir.css))
        .pipe(connect.reload())
});

//发布静态文件到dist目录
gulp.task('images', function () {
    return gulp.src(assetGlobs.images)
        .pipe(gulp.dest(distDir.images))

});
gulp.task('css', function () {
    return gulp.src(assetGlobs.css)
        .pipe(gulp.dest(distDir.css))
        .pipe(connect.reload())
});

//清理template文件
gulp.task('cleanHtml', function () {
    del([
        dist + 'template',
        distDir.css + '/template'
    ])
});

//压缩css，js，图片
gulp.task('minify', ['jsminify', 'cssnano', 'imagemin']);

gulp.task('jsminify', function () {
    return gulp.src(distDir.js)
        .pipe(minify({
            ext: {
                min: '.js'
            },
            ignoreFiles: ['-min.js']
        }))
        .pipe(gulp.dest(distDir.js))
});
gulp.task('cssnano', function () {
    return gulp.src(distDir.css + '/*.css')
        .pipe(gcmq())
        .pipe(gulpif(cssminify, cssnano({
            discardComments: {
                removeAll: true
            },
            discardOverridden: true,
            mergeLonghand: true,
            minifyFontValues: true,
            mergeRules: true,
            minifySelectors: true,
            mergeIdents: true
        })))
        .pipe(gulp.dest(distDir.css))
});
gulp.task('imagemin', function () {
    return gulp.src(distDir.images + '/*')
        .pipe(gulpif(imagemin, imagemin()))
        .pipe(gulp.dest(distDir.images))
});

gulp.task('doyo-build', function () {
    var processors = [
        require('cssgrace')
    ];
    gulp.src(assetGlobs.less, {base: asset.less})
        .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 5 versions', 'IE 6-8', '>2%']
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(doyoDir.css));

    gulp.src(assetGlobs.images)
    // .pipe(gulpif(imagemin, imagemin()))
        .pipe(gulp.dest(doyoDir.images));

    gulp.src(assetGlobs.css)
        .pipe(gulp.dest(doyoDir.css));

    var doyoReg = /\<\%\-\s+include\(\'(.*)\'\)\s+\-?\%\>/g;
    gulp.src(assetGlobs.html, {base: asset.html})
        .pipe(replace(doyoReg, '{include = "$1" }'))
        .pipe(gulp.dest(doyo));
});

