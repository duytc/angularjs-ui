module.exports = {
    dev: {
        options: {
            ignorePath: '<%= appConfig.dirs.build.dev %>',
            template: '<%= appConfig.dirs.build.dev %>/index.html',
            destFile: '<%= appConfig.dirs.build.dev %>/index.html'
        },
        files: [
            {
                cwd: '<%= appConfig.dirs.build.dev %>',
                expand: true,
                src: [
                    '<%= appConfig.vendorFiles.js %>',
                    'templates-app.js',
                    'templates-common.js',
                    '<%= appConfig.appFiles.js %>',
                    'assets/**/*.css'
                ]
            }
        ]
    }
};