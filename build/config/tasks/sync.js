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
                    'fonts/**/*',
                    'images/**/*'
                ],
                dest: '<%= appConfig.dirs.build.dev %>/assets'
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
                dest: '<%= appConfig.dirs.build.dev %>/assets/generated-css'
            }
        ]
    }
};