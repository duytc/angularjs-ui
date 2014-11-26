module.exports = {
    dev: {
        options: {
            sassDir: 'src/styles',
            cssDir: '<%= appConfig.dirs.temp %>/generated-css',
            noLineComments: true,
            relativeAssets: true,
            cacheDir: '<%= appConfig.dirs.temp %>/.sass-cache'
        }
    }
};