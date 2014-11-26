module.exports = {
    options: {
        livereload: true
    },
    gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['build']
    },
    buildConfig: {
        files: 'build/config/**/*.js',
        options: {
            reload: true
        },
        tasks: ['build']
    },
    appSources: {
        files: [
            '<%= appConfig.appFiles.html %>',
            '<%= appConfig.appFiles.js %>',
            '<%= appConfig.appFiles.coreJs %>',
            '<%= appConfig.appFiles.appTemplates %>'
        ],
        tasks: ['build']
    },
    styles: {
        files: [
            '<%= appConfig.appFiles.scss %>',
            '<%= appConfig.appFiles.css %>'
        ],
        tasks: ['build']
    },
    vendorFiles: {
        files: [
            '<%= appConfig.vendorFiles.js %>',
            '<%= appConfig.vendorFiles.css %>'
        ],
        tasks: ['build']
    }
};