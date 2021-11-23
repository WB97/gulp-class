import gulp from "gulp";
import del from "del";
import gejs from "gulp-ejs";
import ws from "gulp-webserver";
import image from "gulp-image";
import gulpSass from "gulp-sass";
import sass1 from "sass";
import autop from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";
import rename from "gulp-rename";

const sass = gulpSass(sass1);

const routes = {
  ejs: {
    watch: "src/**/*.ejs",
    src: "src/*.ejs",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/styles.scss",
    dest: "build/css/",
  },
  js: {
    src: "src/js/main.js",
    dest: "build/js",
    watch: "src/js/**/*.js",
  },
};

const ejs = () => {
  return gulp
    .src(routes.ejs.src)
    .pipe(gejs())
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest(routes.ejs.dest));
};

const clean = () => {
  return del(["build/"]);
};

const webserver = () => {
  return gulp.src("build").pipe(ws({ livereload: true, open: true }));
};

const img = () => {
  return gulp
    .src(routes.img.src)
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));
};

const styles = () => {
  return gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autop())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));
};

const js = () => {
  return gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));
};

const ghdeploy = () => {
  return gulp.src("build/**/*").pipe(ghPages());
};

const watch = () => {
  gulp.watch(routes.ejs.watch, ejs);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]);

const assets = gulp.series([ejs, styles, js]);

const postDev = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, postDev]);
export const deploy = gulp.series([build, ghdeploy]);
