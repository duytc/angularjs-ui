module.exports = {
    options: {
        livereload: true
    },
    gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['build']
    },
    buildConfig: {
        files: 'build.config.js',
        options: {
            reload: true
        },
        tasks: ['build']
    },
    appSources: {
        files: [
            '<%= appConfig.appFiles.html %>',
            '<%= appConfig.appFiles.js %>'
        ],
        tasks: ['build']
    },
    compass: {
        files: ['<%= appConfig.appFiles.scss %>'],
        tasks: ['compass:dev']
    }
};