module.exports = {
    dev: {
        files: [
            {
                expand: true,
                src: [
                    '<%= appConfig.dirs.build.dev %>/src/**/*.js'
                ]
            }
        ]
    }
};