"use strict";

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const server = require("browser-sync");
const sass = require("gulp-sass");
const csso = require("gulp-csso");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const htmlmin = require("gulp-htmlmin");
const pipeline = require("readable-stream").pipeline;
const imagemin = require("gulp-imagemin");
const del = require("del");

gulp.task("css", function () {
    return gulp.src("source/sass/main.scss")
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass({
            includePaths: require('node-normalize-scss').includePaths
        }))
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(csso())
        .pipe(rename("style.min.css"))
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("images", function () {
    return gulp.src("source/img/**/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.mozjpeg({progressive: true}),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
    return gulp.src("source/*.html")
        .pipe(posthtml([
            include()
        ]))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
    return gulp.src([
        "source/img/**/*.{webm,mp4}",
        "source/css/fonts/**",
        "source/css/**/*.css",
        "source/*.ico"
    ], {
        base: "source"
    })
        .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
    return del("build");
});

gulp.task("server", function () {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("source/sass/**/*.scss", gulp.series("css"));
    gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("refresh", function (done) {
    server.reload();
    done();
});

gulp.task("build", gulp.series(
    "clean",
    "copy",
    "css",
    "images",
    "html"
));
gulp.task("start", gulp.series("build", "server"));
