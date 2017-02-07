/**
 * Created by Administrator on 2016/11/11.
 */
const root = "",                //项目目录
    build = root + 'build/',       //开发目录
    src = root + 'www/',           //源文件
    cssminify = true,           //css压缩
    regLessCommit = /\/\/(.*)/g,
    regDoyo = /{{\s*([^\s]*)\s*}}/g,
    serverPort = '800',
    buildDir = {
        css: build + 'css',
        images: build + 'images',
        js: build + 'js',
        fonts: build + 'fonts'
    },
    asset = {
        html: src,
        less: src + 'less/',
        copy: ['images', 'fonts', 'css', 'js']
    }
let lessCommentToCssComment = 0,
    autofix = 0,
    concatMediaQuery = 0


// 模块调用
const gulp = require('gulp'),
    ip = require('ip'),
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
    opacity=require('postcss-opacity'),
    less = require('gulp-less'),
    postcss=require('gulp-postcss'),
    replace = require('gulp-replace'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    te = require('gulp-te'),
    watch = require('gulp-watch'),
    path = require('path'),
    remember = require('gulp-remember'),
    cache=require('gulp-cached'),
    pug=require('gulp-pug'),
    notify = require('gulp-notify')

gulp.task('connect', function () {
    connect.server({
        port: serverPort,
        host: 'localhost',
        root: build,
        livereload: true,
        index: 'noindex.html'
    })
})
gulp.task('default', gulpSequence('defaultInit', ['clean', 'fix']))
gulp.task('dev', gulpSequence('connect', 'initWatch', ['watchHtml', 'watchPug','watchLess', 'watchTemplate', 'watchCss', 'watchLessInCssDir', 'init', 'ipAndOpen']))
gulp.task('test', gulpSequence('connect', 'initWatch', ['watchHtml', 'watchPug','watchLess', 'watchTemplate', 'watchCss', 'watchLessInCssDir', 'init']))

//初始化
gulp.task('init', function () {
    asset.copy.map(function (e) {
        gulp.src(path.join(src, e, '**/*'), {base: path.join(src, e)})
            .pipe(gulp.dest(path.join(build, e)))
    })

    gulp.src(path.join(src, 'css/**/*.less'))
        .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
        .pipe(replace(regLessCommit, '/*$1*/'))
        .pipe(less())
        .pipe(gulp.dest(buildDir.css))

    gulp.src(path.join(src, '/**/*.html'), {base: src})
        .pipe(plumber({errorHandler: notify.onError("html模板编译错误 <%= error.message %>")}))
        .pipe(te())
        .pipe(gulp.dest(build))

    gulp.src(path.join(src, '/**/*.pug'), {base: src})
        .pipe(plumber({errorHandler: notify.onError("pug模板编译错误 <%= error.message %>")}))
        .pipe(pug())
        .pipe(gulp.dest(build))

    del(path.join(buildDir.css, 'less'))

    return gulp.src(path.join(src, 'less/**/*.less'))
        .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
        .pipe(sourcemaps.init())
        .pipe(gulpif(lessCommentToCssComment, replace(regLessCommit, '/*$1*/')))
        .pipe(less())
        .pipe(gulp.dest(buildDir.css + '/less'))
        .pipe(gulpif(autofix, autoprefixer({
            browsers: ['last 5 versions', '>2%']
        })))
        .pipe(contact('all.css'))
        .pipe(gulpif(concatMediaQuery, gcmq()))
        .pipe(sourcemaps.write('', {sourceRoot: "../../www/less"}))
        .pipe(gulp.dest(build + 'css/'))
        .pipe(connect.reload())
})

//监视文件
gulp.task('initWatch', function () {
    asset.copy.map(function (e) {
        if (e != 'css') {
            watch(path.join(src, e, '**/*'), {base: path.join(src, e)}, function () {
                gulp.src(path.join(src, e, '**/*'))
                    .pipe(changed(build + e))
                    .pipe(plumber({errorHandler: notify.onError("<%= error.message %>")}))
                    .pipe(gulp.dest(build + e))
                    .pipe(connect.reload())
            }).on('unlink', function (path) {
                del(path.replace('www', 'build'))
            })
        }
    })
})
gulp.task('watchHtml', function () {
    return watch([asset.html + '**/*.html', '!' + asset.html + 'template/**/*.html'], function () {
        gulp.src(asset.html + '/**/*.html', {base: asset.html})
            .pipe(changed(build))
            .pipe(plumber({errorHandler: notify.onError("html模板编译错误 <%= error.message %>")}))
            .pipe(te())
            .pipe(gulp.dest(build))
            .pipe(connect.reload())
    }).on('unlink', function (path) {
        del(path.replace('www', 'build'))
    });
})
gulp.task('watchPug',function () {
    return watch(asset.html+'**/*.pug',function () {
        gulp.src(asset.html+'/**/*.pug',{base:asset.html})
            .pipe(plumber({errorHandler:notify.onError('pug模板编译错误，请检查语法')}))
            .pipe(pug())
            .pipe(gulp.dest(build))
            .pipe(connect.reload())
    }).on('unlink', function (path) {
        del(path.replace('www', 'build'))
    });
})
gulp.task('watchTemplate', function () {
    return watch(asset.html + 'template/**/*.html', function () {
        gulp.src(asset.html + '/**/*.html', {base: asset.html})
            .pipe(plumber({errorHandler: notify.onError("html模板编译错误 <%= error.message %>")}))
            .pipe(te())
            .pipe(gulp.dest(build))
            .pipe(connect.reload())
    }).on('unlink', function (path) {
        del(path.replace('www', 'build'))
    });
})
gulp.task('watchLess', function () {
    return watch(asset.less + '*.less', function () {
        gulp.src(path.join(src, 'less/**/*.less'))
            .pipe(sourcemaps.init())
            .pipe(cache('watchLess'))
            .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
            .pipe(gulpif(lessCommentToCssComment, replace(regLessCommit, '/*$1*/')))
            .pipe(less())
            .pipe(gulp.dest(buildDir.css + '/less'))
            .pipe(remember('watchLess'))
            .pipe(gulpif(autofix, autoprefixer({
                browsers: ['last 5 versions', '>2%']
            })))
            .pipe(contact('all.css'))
            .pipe(gulpif(concatMediaQuery, gcmq()))
            .pipe(sourcemaps.write('', {sourceRoot: "../../www/less"}))
            .pipe(gulp.dest(build + 'css/'))
            .pipe(connect.reload())
    }).on('unlink', function (path) {
        del(path.replace('www\\less', 'build\\css\\less').replace('.less', '.css'))
    })
})

gulp.task('watchCss', function () {
    const cssPath = path.join(src, 'css')
    return watch([cssPath + '/**/', '!' + cssPath + '/*.less'], function () {
        gulp.src([cssPath + '/**/*', '!/**/*.less'], {base: cssPath})
            .pipe(changed(buildDir.css))
            .pipe(plumber({errorHandler: notify.onError("<%= error.message %>")}))
            .pipe(gulp.dest(buildDir.css))
            .pipe(connect.reload())
    }).on('unlink', function (path) {
        del(path.replace('www', 'build'))
    })
})

gulp.task('watchLessInCssDir', function () {
    const lessPath = path.join(src, 'css/**/*.less')
    return watch(lessPath, function () {
        gulp.src(lessPath)
            .pipe(changed(buildDir.css), {extension: '.css'})
            .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
            .pipe(less())
            .pipe(gulp.dest(buildDir.css))
            .pipe(connect.reload())
    }).on('unlink', function (path) {
        del(path.replace('www', 'build').replace('.less', '.css'))
    })
})

gulp.task('clean', function () {
    setTimeout(function () {
        del(
            [
                build + 'template/',
                buildDir.css + '/less/',
                buildDir.css + '/all.css.map'
            ]
        )
    }, 5000)

})

gulp.task('fix', function () {
    setTimeout(function(){
        let processors = [
            opacity()
        ];
        gulp.start('font-fix')
        return gulp.src(path.join(buildDir.css, 'all.css'))
            .pipe(postcss(processors))
            .pipe(gcmq())
            .pipe(gulpif(cssminify, cssnano({
                discardComments: false,
                discardUnused: false,
                core:false
            })))
            .pipe(gulp.dest(buildDir.css))
    },3000)
})

gulp.task('font-fix',function(){

    return gulp.src(path.join(buildDir.css,'*.css'))
        .pipe(
            postcss([
                require('postcss-font-magician')({
                    hosted: '../fonts'
                })
            ])
        )
        .pipe(gulp.dest(buildDir.css))
})

gulp.task('defaultInit', function () {
    lessCommentToCssComment = 1
    autofix = 1
    concatMediaQuery = 1
    return gulp.start('init')
})

gulp.task('ipAndOpen', function () {
    console.log('请在其他设备设备上访问:-----' + ip.address() + ':' + serverPort)
    open("http://"+ip.address() +":"+ serverPort.toString())
})

gulp.task('doyo', function () {
    asset.copy.map(function (e) {
        gulp.src(path.join(src, e, '**/*'), {base: path.join(src, e)})
            .pipe(gulp.dest(path.join(build, e)))
    })

    gulp.src(path.join(src, 'css/**/*.less'))
        .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
        .pipe(replace(regLessCommit, '/*$1*/'))
        .pipe(less())
        .pipe(gulp.dest(buildDir.css))

    gulp.src(path.join(src, '/**/*.html'), {base: src})
        .pipe(replace(regDoyo, '{include="$1.html"}'))
        .pipe(gulp.dest(build))

    gulp.src(asset.html + '/template/*.html')
        .pipe(gulp.dest(build + 'template/'))

    gulp.src(path.join(src, 'less/**/*.less'))
        .pipe(plumber({errorHandler: notify.onError("less编译错误<%= error.message %>")}))
        .pipe(sourcemaps.init())
        .pipe(gulpif(lessCommentToCssComment, replace(regLessCommit, '/*$1*/')))
        .pipe(less())
        .pipe(gulp.dest(buildDir.css + '/less'))
        .pipe(gulpif(autofix, autoprefixer({
            browsers: ['last 5 versions', '>2%']
        })))
        .pipe(contact('all.css'))
        .pipe(gulpif(concatMediaQuery, gcmq()))
        .pipe(sourcemaps.write('', {sourceRoot: "../../www/less"}))
        .pipe(gulp.dest(build + 'css/'))
        .pipe(connect.reload())

    setTimeout(function () {
        del(
            [
                buildDir.css + '/less/',
                buildDir.css + '/all.css.map'
            ]
        )
    }, 3000)
})

gulp.task('watchServer',function(){
    connect.server({
        port: serverPort,
        host: 'localhost',
        root: 'www',
        livereload: true,
        index: 'noindex.html'
    })
})
gulp.task('watch',['watchServer'],function () {
    return watch('www/**/*')
        .pipe(connect.reload())
})

