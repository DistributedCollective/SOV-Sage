module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      eslint: {
        command: 'npm run eslint',
      },
      'prettier-fmt': {
        command: function () {
          const nodeMajor = parseInt(
            process.version.slice(1).split('.')[0],
            10
          );
          if (nodeMajor < 10) {
            return "echo 'NOT running prettier on node < v10'";
          }
          return 'npm run prettier-fmt';
        },
      },
      'prettier-check': {
        command: function () {
          const nodeMajor = parseInt(
            process.version.slice(1).split('.')[0],
            10
          );
          if (nodeMajor < 10) {
            return "echo 'NOT running prettier on node < v10'";
          }
          return 'npm run prettier-check';
        },
      },
    },
  });

  // grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['lint']);

  // linting
  grunt.registerTask('lint', ['exec:eslint', 'exec:prettier-check']);
};
