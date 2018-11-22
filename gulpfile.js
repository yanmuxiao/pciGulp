let gulp = require('gulp'),
  connect = require('gulp-connect'), // 热加载，和browser-sync一样
  proxy = require('http-proxy-middleware'); // 设置代理


let sass = require('gulp-sass'); // 需要结合node-sass
let gulpIf = require('gulp-if');
let autoprefixer = require('gulp-autoprefixer');
let useref = require('gulp-useref'); 
// let cleanCss = require('gulp-clean-css');

// 压缩和打包操作依赖
let minifycss=require('gulp-minify-css'),   //css压缩
    concat=require('gulp-concat'),   //合并文件
    uglify=require('gulp-uglify'),   //js压缩
    rename=require('gulp-rename'),   //文件重命名
    notify=require('gulp-notify'),   //提示
    clean = require('gulp-clean');


let imageMin = require('gulp-imagemin');
let cache = require('gulp-cache');


let path = './app/test'; // 项目路径
let distPath = './app/dist'; // 项目打包路径
 
gulp.task('connect', function() {
  connect.server({
    root: 'app',
    host: '172.28.50.57',
    port: 9088,
    livereload: true,
    middleware: function (connect, opt) {
        return [
            proxy('/api', {
                target: 'http://172.28.50.57:8080',
                changeOrigin:true,
                pathRewrite: {
                  '^/api': ''
                }
            }),
            proxy('/eapui', {
                target: 'http://172.25.20.12:9082',
                changeOrigin:true,
                pathRewrite: {
                  '^/eapui': ''
                }
            }),
            proxy('/bpauth', {
                target: 'http://192.168.24.77:8080',
                changeOrigin:true,
                pathRewrite: {
                  '^/api': ''
                }
            })
        ]
    }
  });
});
 
gulp.task('html', function () {
  gulp.src(path + '/*.html')
    .pipe(connect.reload());
});
gulp.task('stylus', function () {
  gulp.src(path + '/css/*.css')
    .pipe(connect.reload());
});
gulp.task('js', function () {
  gulp.src(path + '/js/*.js')
    .pipe(connect.reload());
});
// Gulp执行预处理==>使用gulp-sass插件来编译Sass。
gulp.task('sass', function() {
 return gulp.src(path + '/scss/*.scss')
   .pipe(sass())
   .pipe(autoprefixer({
        // 自动补全css前缀
        // browsers: ['last 2 versions'],
        browsers: ['last 10 Chrome versions', 'last 5 Firefox versions', 'Safari >= 6', 'ie > 8'],
        cascade: false
    }))
   .pipe(gulp.dest(path + '/css'));
})
gulp.task('watch', function () {
    gulp.watch([path + '/*.html'], ['html']);
    gulp.watch([path + '/css/*.css'], ['stylus']);
    gulp.watch([path + '/js/*.js'], ['js']);
    gulp.watch([path + '/scss/*.scss'], ['sass']);
});
gulp.task('default', [ 'watch', 'connect']);




// css和js压缩操作
gulp.task('minitycss', function() {
  return gulp.src(path + '/css/*.minity.css')
    .pipe(concat('main.css'))             //合并css命名为main.css
    .pipe(gulp.dest(path + '/dist/css'))  //输出
    .pipe(rename({suffix:'.min'}))        //重命名加.min
    .pipe(minifycss())                    //压缩
    .pipe(gulp.dest(path + '/dist/css'))  //输出 
    .pipe(notify({message:"css task ok"}));    //提示
});
gulp.task('minityjs', function() {
  return gulp.src(path + '/js/*.minity.js')
    .pipe(concat('main.js'))            //合并js命名为main.js
    .pipe(gulp.dest(path + '/dist/js')) //输出
    .pipe(rename({suffix:'.min'}))      //重命名名加.min
    .pipe(uglify())                     //压缩
    .pipe(gulp.dest(path + '/dist/js')) //输出 
    .pipe(notify({message:"js task ok"}));    //提示
});
gulp.task('minity', ['minitycss', 'minityjs'], function() {
    gulp.src('').pipe(notify({message:"css和js压缩操作已完成，请执行: gulp build操作！"}));
});



// 打包命令 ==> 迁移js和css到一个文件内
gulp.task('clean', function() {
  return gulp.src(distPath)
    .pipe(clean())
})
gulp.task('userefHtml', function() {
  return gulp.src(path + '/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.css', minifycss()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest(distPath));
});
gulp.task('userefFonts', function() {
  return gulp.src(path + '/fonts/*')
    .pipe(gulp.dest(distPath + '/fonts'));
});
gulp.task('userefCss', function() {
  // return gulp.src([path + '/css/normalize.css', path + '/css/rem.css'])
  return gulp.src([path + '/css/*'])
    .pipe(gulp.dest(distPath + '/css'));
});
gulp.task('userefJs', function() {
  return gulp.src([path + '/js/*'])
    .pipe(gulp.dest(distPath + '/js'));
});


// 图片压缩
gulp.task('imagesCache', function(){
    return gulp.src([path + '/images/*.+(png|jpg|gif|svg)'])
      .pipe(cache(imageMin({
          interlaced: true
      })))
      .pipe(gulp.dest(distPath + '/images'))
});

gulp.task('build', ['clean'], function() {
    gulp.start('userefCss', 'userefJs', 'userefFonts', 'userefHtml', 'imagesCache', function() {
        gulp.src('').pipe(notify({ message:"build打包完成！" }));
    });
});

