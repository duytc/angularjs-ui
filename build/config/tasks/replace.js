module.exports = function(grunt, options) {
    var config = {};

    function getPattern(apiEndPoint) {
        if (typeof apiEndPoint !== 'string') {
            grunt.fail.warn('apiEndPoint should be a string');
        }

        return {
            match: /\.constant\(['"]API_END_POINT['"],\s?['"].*?['"]\)/,
            replacement: '.constant("API_END_POINT","' + apiEndPoint + '")' // matching quote style to uglifyjs
        }
    }

    var devApiEndPoint;

    try {
        devApiEndPoint = options.userConfig.apiEndPoint;
    } catch (e) {
        devApiEndPoint = null;
    }

    if (typeof devApiEndPoint !== 'string') {
        devApiEndPoint = '//api.tagcade.dev/app_dev.php/api';
    }

    config.dev = {
        options: {
            patterns: [
                getPattern(devApiEndPoint)
            ]
        },
        files: [
            {
                expand: true,
                src: [
                    '<%= appConfig.dirs.build.dev %>/src/app/core/_core.js'
                ]
            }
        ]
    };

    config.prod = {
        options: {
            patterns: [
                getPattern('//api.tagcade.com/api')
            ]
        },
        files: [
            {
                expand: true,
                src: [
                    '<%= appConfig.dirs.build.prod %>/app*.js'
                ]
            }
        ]
    };

    return config;
};