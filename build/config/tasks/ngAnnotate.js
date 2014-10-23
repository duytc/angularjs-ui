module.exports = {
    dev: {
        files: [
            {
                expand: true,
                cwd: '<%= appConfig.dirs.build.dev %>',
                src: [
                    'src/**/*.js'
                ],
                dest: '<%= appConfig.dirs.build.dev %>'
            }
        ]
    }
};