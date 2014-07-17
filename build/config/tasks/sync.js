module.exports = {
    dev: {
        files: [
            {
                expand: true,
                src: [
                    '<%= appConfig.appFiles.js %>',
                    '<%= appConfig.vendorFiles.js %>',
                    '<%= appConfig.vendorFiles.css %>'
                ],
                dest: '<%= appConfig.dirs.build.dev %>'
            },
            {
                expand: true,
                cwd: 'src',
                src: [
                    'assets/**/*',
                    'favicon.ico',
                ],
                dest: '<%= appConfig.dirs.build.dev %>'
            },
            {
                expand: true,
                cwd: 'src/styles',
                src: [
                    'img/**/*'
                ],
                dest: '<%= appConfig.dirs.build.dev %>/assets/css'
            },
            {
                expand: true,
                flatten: true,
                src: [
                    '<%= appConfig.appFiles.html %>'
                ],
                dest: '<%= appConfig.dirs.build.dev %>'
            },
            {
                expand: true,
                cwd: '<%= appConfig.dirs.temp %>/templates',
                src: [
                    '*.js'
                ],
                dest: '<%= appConfig.dirs.build.dev %>'
            },

            {
                expand: true,
                flatten: true,
                cwd: '<%= appConfig.dirs.temp %>/generated-css',
                src: [
                    '*.css'
                ],
                dest: '<%= appConfig.dirs.build.dev %>/assets/css'
            }
        ]
    }
};