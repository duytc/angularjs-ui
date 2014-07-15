module.exports = {
    options: {
        jshintrc: '.jshintrc'
    },
    all: [
        'Gruntfile.js',
        '<%= appConfig.appFiles.js %>'
    ]
};