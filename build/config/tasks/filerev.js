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
    }
};