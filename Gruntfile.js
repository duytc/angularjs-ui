module.exports = function(grunt) {
    if (!grunt.file.exists('./build/config/userConfig.js')) {
        grunt.fail.fatal('You must create the build/config/userConfig.js file');
    }

    var options = {
        config : {
            src: [
                'build/config/userConfig.js',
                'build/config/**/*.js*',
                '!build/config/**/*.dist'
            ]
        }
    };

    var configs = require('load-grunt-configs')(grunt, options);
    grunt.initConfig(configs);

    require('load-grunt-tasks')(grunt);

    grunt.renameTask('delete_sync', 'deleteSync');

    grunt.registerTask('default', [
        'build',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('build', [
        'html2js:app',
        'html2js:common',
        'compass:server',
        'sync:dev',
        'deleteSync:dev',
        'cleanempty:dev',
        'injector:dev',
        'ngAnnotate:dev',
        'replace:dev'
    ]);

    grunt.registerTask('build-prod', [
        'build',
        'clean:prod',
        'sync:prod',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev:prod',
        'usemin',
        'replace:prod'
    ]);
};