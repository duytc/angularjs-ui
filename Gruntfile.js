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

    grunt.loadNpmTasks('grunt-protractor-webdriver');

    grunt.renameTask('delete_sync', 'deleteSync');

    grunt.registerTask('fileReplace:prodWhiteLabel', 'replace logo.png and logo-header.png', function(){

        grunt.file.copy(
            configs.appConfig.deployment.origin.prodWhiteLabel.image.logo,
            configs.appConfig.dirs.build.prodWhiteLabel + '/assets/images/logo.png'
        );

        grunt.file.copy(
            configs.appConfig.deployment.origin.prodWhiteLabel.image.logoHeader,
            configs.appConfig.dirs.build.prodWhiteLabel + '/assets/images/logo-header.png'
        );
    });

    grunt.registerTask('default', [
        'build',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('__build', [
        'html2js:app',
        'html2js:common',
        'sass:dev',
        'sync:dev',
        'deleteSync:dev',
        'cleanempty:dev',
        'injector:dev',
        'ngAnnotate:dev'
    ]);

    grunt.registerTask('build', [
        '__build',
        'replace:dev'
    ]);

    grunt.registerTask('build-prod', [
        '__build',
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

    grunt.registerTask('build-prod-white-label-default', [
        'build-prod',
        'clean:prodWhiteLabel',
        'sync:prodWhiteLabel',
        'replace:prodWhiteLabel',
        'fileReplace:prodWhiteLabel'
    ]);

    grunt.registerTask('build-prod-white-label-custom', 'Task to build white label target', function() {
        var title = grunt.option('title');
        var logo = grunt.option('logo');
        var logoHeader = grunt.option('logoHeader');
        if (!!title) {
            configs.appConfig.deployment.origin.prodWhiteLabel.title.replacement = title;
        }

        if (!!logo) {
            configs.appConfig.deployment.origin.prodWhiteLabel.image.logo = logo;
        }

        if (!!logoHeader) {
            configs.appConfig.deployment.origin.prodWhiteLabel.image.logoHeader = logoHeader;
        }

        grunt.task.run('build-prod-white-label-default');
    });

    grunt.registerTask('e2e-admin', [
        'protractor_webdriver',
        'protractor:e2eAdmin'
    ]);

    grunt.registerTask('e2e-pub', [
        'protractor_webdriver',
        'protractor:e2ePub'
    ]);

    grunt.registerTask('e2e', [
        'protractor_webdriver:alive',
        'protractor:e2ePub',
        'protractor:e2eAdmin'
    ]);


};