// Gulp ======================================================================
gulp = require("gulp");
jade = require("gulp-jade");
htmlmin = require("gulp-htmlmin");
sass = require("gulp-sass");
autoprefixer = require("gulp-autoprefixer");
cssnano = require("gulp-cssnano");
coffee = require("gulp-coffee");
browserSync = require("browser-sync");
readTree = require("./readTree");
rename = require("gulp-rename");

const path = require("path");
const fs = require("fs");

// Functions =================================================================
titleCase = function(str) {
  str = str.replace(/(^|\b)([a-z])([a-z]+)/g, function(
    match,
    space,
    first,
    rest
  ) {
    return `${space}${first.toUpperCase()}${rest}`;
  });
};

capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : "";
  const baseDir = isRelativeToScript ? __dirname : ".";

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === "EEXIST") {
        // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === "ENOENT") {
        // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ["EACCES", "EPERM", "EISDIR"].indexOf(err.code) > -1;
      if (!caughtErr || (caughtErr && targetDir === curDir)) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  }, initDir);
}

gulp.task("sync", function() {
  return browserSync({
    server: {
      index: "index.html"
    }
  });
});

gulp.task("coffee", function() {
  return gulp
    .src("./_coffee/*")
    .pipe(coffee())
    .pipe(gulp.dest("_js/"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

// Compile jade
gulp.task("jade", function() {
  return readTree(function(
    err,
    full_list_obj,
    popular_list_obj,
    index_list_obj
  ) {
    if (err) {
      console.error("Error loading tree", err);
      return;
    }

    // Sort the list in categories
    sorted_full = [];
    for (title in full_list_obj) {
      list_data = full_list_obj[title];

      sorted_full.push({ title, list_data });
    }
    sorted_full.sort(function(a, b) {
      return a.title.localeCompare(b.title);
    });

    // Sort the index
    sorted_index = [];
    for (filename in index_list_obj) {
      list_data = index_list_obj[filename];
      sorted_index.push({ filename, list_data });
    }
    sorted_index.sort(function(c, d) {
      return c.filename.localeCompare(d.filename);
    });

    // Create folders for each category
    sorted_full.forEach(function(dir) {
      var category = dir.title;

      if (!fs.existsSync(dir.title)) {
        mkDirByPathSync("./dist/" + dir.title);
      }

      // Compile category pages
      gulp
        .src(["./_jade/**/category.jade"])
        .pipe(
          jade({
            pretty: false,
            data: {
              category: dir,
              capitalize
            }
          })
        )
        .pipe(
          htmlmin({
            collapseWhitespace: true
          })
        )
        .pipe(rename("index.html"))
        .pipe(gulp.dest("./dist/" + dir.title));
    });

    // Compile list pages
    sorted_index.forEach(function(list) {
      var list_url =
        "./dist/" + list.list_data.category + "/" + list.list_data.folder;

      if (!fs.existsSync(list_url)) {
        mkDirByPathSync(list_url);
        // console.log("-- New 📁 " + list_url);
      }

      gulp
        .src(["./_jade/**/list.jade"])
        .pipe(
          jade({
            pretty: true,
            data: {
              list: list.list_data,
              capitalize
            }
          })
        )
        .pipe(
          htmlmin({
            collapseWhitespace: true
          })
        )
        .pipe(rename("index.html"))
        .pipe(
          gulp.dest(
            "./dist/" + list.list_data.category + "/" + list.list_data.folder
          )
        );
    });

    // Compile homepage
    gulp
      .src(["./_jade/**/index.jade"])
      .pipe(
        jade({
          pretty: true,
          data: {
            full_list: sorted_full,
            titleCase,
            capitalize,
            popular_list: popular_list_obj,
            titleCase,
            capitalize,
            index_list: sorted_index,
            titleCase,
            capitalize
          }
        })
      )
      .pipe(
        htmlmin({
          collapseWhitespace: true
        })
      )
      .pipe(gulp.dest("./dist"))
      .pipe(
        browserSync.reload({
          stream: true
        })
      );
  });
});

// Compile submit page
gulp.task("submit", function() {
  return gulp
    .src(["./_jade/submit.jade"])
    .pipe(
      jade({
        pretty: false
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true
      })
    )
    .pipe(rename("index.html"))
    .pipe(gulp.dest("./dist/submit"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

// Compile success page
gulp.task("success", function() {
  return gulp
    .src(["./_jade/success.jade"])
    .pipe(
      jade({
        pretty: false
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true
      })
    )
    .pipe(rename("index.html"))
    .pipe(gulp.dest("./dist/success"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

// Compile SCSS
gulp.task("scss", function() {
  return gulp
    .src("_scss/style.scss")
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(cssnano())
    .pipe(gulp.dest("_css"))
    .pipe(gulp.dest("./dist/_css"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

// Build task for deployment
gulp.task("build", function() {
  gulp.run("coffee", "jade", "submit", "success", "scss");
  // gulp.src("_img/*").pipe(gulp.dest("./dist/_img"));
  // gulp.src("_js/*").pipe(gulp.dest("./dist/_js"));
});

gulp.task("default", function() {
  gulp.run("build", "sync");

  gulp.watch("./_coffee/*", function() {
    return gulp.run("coffee");
  });
  gulp.watch("./_scss/*", function() {
    return gulp.run("scss");
  });
  gulp.watch(["./_jade/submit.jade"], function() {
    return gulp.run("submit");
  });
  gulp.watch(["./_jade/success.jade"], function() {
    return gulp.run("success");
  });
  return gulp.watch(["./_jade/**/*.jade"], function() {
    return gulp.run("jade");
  });
});
