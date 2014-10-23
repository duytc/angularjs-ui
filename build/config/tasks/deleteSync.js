module.exports = {
    dev: {
        files: [
            {
                cwd: '<%= appConfig.dirs.build.dev %>',
                src: ['<%= appConfig.appFiles.html %>'],
                syncWith: 'src'
            },
            {
                cwd: '<%= appConfig.dirs.build.dev %>/src',
                src: ['**/*.js'],
                syncWith: 'src'
            },
            {
                cwd: '<%= appConfig.dirs.build.dev %>/vendor',
                src: [
                    '**/*.js',
                    '**/*.css'
                ],
                syncWith: 'vendor'
            }
        ]
    }
};