var _ = require("lodash");

module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-compress");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-shell");
  grunt.loadNpmTasks("grunt-notify");

  grunt.config.init({
    pkg: grunt.file.readJSON("package.json"),

    buildDir: "./static",
    configDir: "./config",
    appConfig: "<%= configDir %>/app.json",
    dbConfig: "<%= configDir %>/db.json",

    clean: ["<%= buildDir %>"],

    copy: {
      main: {
        files: [{
          expand: true,
          cwd: "src/client/",
          src: ["*.html"],
          dest: "<%= buildDir %>/",
          filter: function(file) { return !/.*~/.test(file); }
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: "config/jshint.conf.json"
      },
      files: ["src/server/**/*.js", "src/client/js/**/*.js"]
    },

    shell: {

      db: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: "$(npm bin)/sequelize --migrate --config <%= dbConfig %>"
      },

      "db-undo": {
        options: {
          stdout: true,
          failOnError: true
        },
        command: "$(npm bin)/sequelize --migrate --undo --config <%= dbConfig %>"
      },
      
      migrate: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: function(name) {
          return ("$(npm bin)/sequelize --create-migration " +
                  name +
                  " --config <%= dbConfig %>");
        }
      },
      
      release: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: function(type) {
          var validTypes = ["patch", "minor", "major"];
          type = type || "patch";
          if (!~validTypes.indexOf(type)) {
            grunt.warn(
              "Release type must be one of "+validTypes.join(", "));
          }
          return [
            "git remote update",
            "git checkout develop",
            "git pull --ff-only",
            "git merge origin/master --ff-only",
            "npm version "+type+" -m 'Upgrading to %s'",
            "git checkout master",
            "git pull --ff-only",
            "git merge develop --ff-only",
            "git checkout develop"
          ].join(" && ");
        }
      },

      publish: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: [
          "git push origin develop:develop",
          "git push origin master:master",
          "git push --tags"
        ].join(" && ")
      },

      deps: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: [
          "npm install",
          "npm update",
          "$(npm bin)/bower install",
          "$(npm bin)/bower update"
        ].join(" && ")
      },

      loc: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: ("cloc src --by-file-by-lang " +
                  "--force-lang=css,styl --force-lang=html,mustache")
      }
    }
  });

  grunt.registerTask("release", "Make a release.", function(type) {
    grunt.task.run("default", "shell:release"+(type ?":"+type:""));
  });
  grunt.registerTask(
    "publish", "Push out develop, master, and tags", ["shell:publish"]);
  grunt.registerTask(
    "loc", "Print current linecount statistics", ["shell:loc"]);
  grunt.registerTask(
    "deps", "Installs and updates npm and bower dependencies", ["shell:deps"]);
};
