/*** Created by Doveaz on 2016/9/24.  https://github.com/DoveAz/gulp5811 */

var root = "test/",                //项目目录

    build = root + 'build/',       //开发目录
    www = root + 'www/',           //源文件
    dist = root + 'dist/',         //发布目录
    doyo = root + 'doyo/',         //发布适合doyo的文件

    serverRoot = build,            //服务器根目录
    serverPort = '80',             //服务器端口
    serverIndex = "noindex.html",  //服务器默认打开页面（为了显示页面列表，设置noindex.html）
    serverHost = 'localhost';      //服务器地址


var imageminStatus = false,               //是否开启图片压缩
    sprite = false,                //是否合并雪碧图
    babelStatus = false,             //是否使用babel编译js
    cssminify = true;              //css压缩

//开发目录文件夹
var buildDir = {
    css: build + 'css',
    images: build + 'images',
    js: build + 'js'
};

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
    open = require("open"),
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
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'),
    postcss = require('gulp-postcss'),
    spriter = require('gulp-css-spriter'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    through = require('through2'),
    babel = require('gulp-babel'),
    cssgrace = require('cssgrace');

//默认任务
gulp.task('default', gulpSequence(['watch', 'ejs', 'less', 'js','css', 'images', 'connect'],'open'));

//发布 会清理html和css模板文件,并且压缩css，js
gulp.task('dist', gulpSequence('copy-to-dist', 'clean', 'minify'));

//发布适合doyo cms使用的文件 会替换include标签 并清理css模板文件
gulp.task('doyo', gulpSequence('copy-to-doyo', 'clean-to-doyo', 'minify-to-doyo'));

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

gulp.task('open',function(){
    open("http://localhost:"+serverPort.toString());
});

//监视文件
gulp.task('watch', function () {
    gulp.watch(assetGlobs.html, ['ejs']);
    gulp.watch(assetGlobs.less, ['less']);
    gulp.watch(assetGlobs.css, ['css']);
    gulp.watch(assetGlobs.images, ['images']);
    gulp.watch(assetGlobs.js,['js'])
});


gulp.task('justwatch',function(){
        connect.server({
            port: serverPort,
            host: serverHost,
            root: www,
            livereload: true,
            index: serverIndex
    });
    gulp.watch(assetGlobs.html, function(){
        gulp.src(assetGlobs.html)
            .pipe(connect.reload())
    });
    gulp.watch(assetGlobs.less, function(){
        gulp.src(assetGlobs.less)
            .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
            .pipe(less())
            .pipe(gulp.dest(asset.css))
            .pipe(connect.reload())
    });
    gulp.watch(assetGlobs.css, function(){
        gulp.src(assetGlobs.css)
            .pipe(connect.reload())
    });
    gulp.watch(assetGlobs.js,function(){
        gulp.src(assetGlobs.js)
            .pipe(connect.reload())
    });
    open("http://localhost:"+serverPort.toString());
});


//编译ejs
gulp.task('ejs', function () {
    return gulp.src(assetGlobs.html, {base: asset.html})
        .pipe(plumber({errorHandler: notify.onError("ejs编译失败，请检查代码")}))
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
            browsers: ['last 10 versions', 'IE 6-8', '>1%']
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(buildDir.css))
        .pipe(connect.reload())
});

//复制静态文件到build目录
gulp.task('images', function () {
    return gulp.src(assetGlobs.images)
        .pipe(gulp.dest(buildDir.images))

});

gulp.task('css', function () {
    return gulp.src(assetGlobs.css)
        .pipe(gulp.dest(buildDir.css))
        .pipe(connect.reload())
});

gulp.task('js',function(){
    return gulp.src(assetGlobs.js)
        .pipe(gulpif(babelStatus, babel({
            presets: ['es2015']
        })))
        .pipe(gulp.dest(buildDir.js))
});

//清理template文件
gulp.task('clean', function () {
    return del([
        dist + 'template/',
        distDir.css + '/template/'
    ]);
});

//压缩css，js，图片
gulp.task('minify', ['jsminify', 'cssnano', 'imagemin']);

gulp.task('jsminify', function () {
    return gulp.src(distDir.js + '/*')
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

//清理doyo
gulp.task('clean-to-doyo', function () {
    return del([
        doyoDir.css + '/template/'
    ]);
});

gulp.task('minify-to-doyo', ['jsminify-to-doyo', 'cssnano-to-doyo', 'imagemin-to-doyo']);

gulp.task('jsminify-to-doyo', function () {
    return gulp.src(doyoDir.js + '/*')
        .pipe(minify({
            ext: {
                min: '.js'
            },
            ignoreFiles: ['-min.js']
        }))
        .pipe(gulp.dest(doyoDir.js))
});

gulp.task('cssnano-to-doyo', function () {
    return gulp.src(doyoDir.css + '/*.css')
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
        .pipe(gulp.dest(doyoDir.css))
});

gulp.task('imagemin-to-doyo', function () {
    return gulp.src(doyoDir.images + '/*')
        .pipe(gulpif(imageminStatus, imagemin()))
        .pipe(gulp.dest(doyoDir.images))
});

gulp.task('copy-to-dist', gulpSequence('dist-less', 'dist-html', 'dist-image', 'dist-css', 'dist-js'));

gulp.task('dist-less', function () {
    var processors = [
        require('cssgrace')
    ];
    return gulp.src(assetGlobs.less, {base: asset.less})
        .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 5 versions', 'IE 6-8', '>2%']
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(distDir.css));

});

gulp.task('dist-html', function () {
    return gulp.src(assetGlobs.html, {base: asset.html})
        .pipe(ejs())
        .pipe(gulp.dest(dist));

});

gulp.task('dist-image', function () {
    return gulp.src(assetGlobs.images)
        .pipe(gulp.dest(distDir.images));
});

gulp.task('dist-css', function () {
    return gulp.src(assetGlobs.css)
        .pipe(gulp.dest(distDir.css));
});

gulp.task('dist-js', function () {
    return gulp.src(assetGlobs.js)
        .pipe(gulpif(babelStatus, babel({
            presets: ['es2015']
        })))
        .pipe(gulp.dest(distDir.js))
});

gulp.task('copy-to-doyo', gulpSequence('doyo-less', 'doyo-html', 'doyo-image', 'doyo-css', 'doyo-js'));

gulp.task('doyo-less', function () {
    var processors = [
        require('cssgrace')
    ];
    return gulp.src(assetGlobs.less, {base: asset.less})
        .pipe(plumber({errorHandler: notify.onError("less编译失败，请检查代码")}))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 5 versions', 'IE 6-8', '>2%']
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(doyoDir.css));

});

gulp.task('doyo-html', function () {
    var doyoReg = /\<\%\-\s+include\(\'(.*)\'\)\s+\-?\%\>/g;
    return gulp.src(assetGlobs.html, {base: asset.html})
        .pipe(replace(doyoReg, '{include = "$1" }'))
        .pipe(gulp.dest(doyo));
});

gulp.task('doyo-image', function () {
    return gulp.src(assetGlobs.images)
        .pipe(gulp.dest(doyoDir.images));
});

gulp.task('doyo-css', function () {
    return gulp.src(assetGlobs.css)
        .pipe(gulp.dest(doyoDir.css));
});

gulp.task('doyo-js', function () {
    return gulp.src(assetGlobs.js)
        .pipe(gulpif(babelStatus, babel({
            presets: ['es2015']
        })))
        .pipe(gulp.dest(doyoDir.js))
});

