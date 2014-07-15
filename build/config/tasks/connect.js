module.exports = {
    server: {
        options: {
            livereload: true,
            base: '<%= appConfig.dirs.build.dev %>',
            hostname: '<%= userConfig.hostname %>',
            port: '<%= userConfig.port %>',
            open: {
                target: '<%= userConfig.appUrl %>',
                appName: '<%= userConfig.browser %>'
            }
        }
    }
};