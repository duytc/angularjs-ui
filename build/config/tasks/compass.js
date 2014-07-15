module.exports = {
    server: {
        options: {
            sassDir: 'src/styles',
            cssDir: '<%= appConfig.dirs.temp %>/generated-css',
            imagesDir: "src/styles/ui/images/",
            noLineComments: true,
            relativeAssets: true,
            cacheDir: '<%= appConfig.dirs.temp %>/.sass-cache'
        }
    }
};