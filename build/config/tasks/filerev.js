module.exports = {
    options: {
        algorithm: 'md5',
        length: 8
    },
    prod: {
        src: [
            '<%= appConfig.dirs.build.prod %>/app.js',
            '<%= appConfig.dirs.build.prod %>/assets/css/app.css'
        ]
    },
    prodWhiteLabel: {
        src: [
            '<%= appConfig.dirs.build.prodWhiteLabel %>/app.js',
            '<%= appConfig.dirs.build.prodWhiteLabel %>/assets/css/app.css'
        ]
    }
};