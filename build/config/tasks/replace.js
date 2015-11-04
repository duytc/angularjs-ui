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
        devApiEndPoint = 'http://api.tagcade.dev/app_dev.php/api';
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
                    '<%= appConfig.dirs.build.dev %>/src/app/core/bootstrap/config.js'
                ]
            }
        ]
    };

    config.prod = {
        options: {
            patterns: [
                getPattern('https://api.tagcade.com/api'),
                {
                    match: '<%= appConfig.deployment.origin.dev.match %>',
                    replacement:  '<%= appConfig.deployment.origin.prod.val %>'
                }
            ]
        },
        files: [
            {
                expand: true,
                src: [
                    '<%= appConfig.dirs.build.prod %>/app*.js',
                    '<%= appConfig.dirs.build.prod %>/index.html'
                ]
            }
        ]
    };
    config.prodWhiteLabel = {
        options: {
            patterns: [
                {
                    match: '<%=  appConfig.deployment.origin.prodWhiteLabel.title.match %>',
                    replacement:  '<%= appConfig.deployment.origin.prodWhiteLabel.title.replacement %>'
                }
            ]
        },
        files: [
            {
                expand: true,
                src: [
                    '<%= appConfig.dirs.build.prodWhiteLabel %>/index.html',
                    '<%= appConfig.dirs.build.prodWhiteLabel %>/src/app/core/config.js'
                ]
            }
        ]
    };
    return config;
};