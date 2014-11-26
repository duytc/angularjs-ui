module.exports = {
    dev: {
        options: {
            sourcemap: 'none',
            unixNewlines: true,
            cacheLocation: '<%= appConfig.dirs.temp %>/.sass-cache'
        },
        files: [{
            expand: true,
            cwd: 'src/styles',
            src: ['**/*.scss'],
            dest: '<%= appConfig.dirs.temp %>/generated-css',
            ext: '.css'
        }]
    }
};