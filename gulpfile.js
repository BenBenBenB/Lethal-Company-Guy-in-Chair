import gulp from "gulp";
// import sass from "gulp-sass"(require("sass"));
import bs from "browser-sync";
import { rollup } from "rollup";
import rollupConfig from "./rollup.config.js";

const browserSync = bs.create();

async function buildWithRollup() {
  const bundle = await rollup(rollupConfig);
  await bundle.write(rollupConfig.output);
}

function styles() {
  return gulp
    .src("sass/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("css"))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });

  // TODO: implement sass stuff
  //watch("sass/**/*.scss", styles);
  gulp.watch("src/**/*.ts", buildWithRollup).on("change", browserSync.reload);
  gulp.watch("*.html").on("change", browserSync.reload);
  gulp.watch("dist/**/*.js").on("change", browserSync.reload);
  gulp.watch("css/main.css").on("change", browserSync.reload);
}

// TODO: implement sass stuff
export default gulp.series(/*styles,*/ buildWithRollup, serve);
