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

    function getUnifiedPattern(apiUnifiedEndPoint) {
        if (typeof apiUnifiedEndPoint !== 'string') {
            grunt.fail.warn('apiEndPoint should be a string');
        }

        return {
            match: /\.constant\(['"]API_UNIFIED_END_POINT['"],\s?['"].*?['"]\)/,
            replacement: '.constant("API_UNIFIED_END_POINT","' + apiUnifiedEndPoint + '")' // matching quote style to uglifyjs
        }
    }

    config.dev = {
        options: {
            patterns: [
                getPattern('<%= appConfig.deployment.origin.dev.tagcade.apiEndPoint %>'),
                getUnifiedPattern('<%= appConfig.deployment.origin.dev.unified.apiEndPoint %>'),
                {
                    match: '<%= appConfig.deployment.origin.dev.tagcade.match %>',
                    replacement:  '<%= appConfig.deployment.origin.dev.tagcade.val %>'
                },
                {
                    match: '<%= appConfig.deployment.origin.dev.unified.match %>',
                    replacement:  '<%= appConfig.deployment.origin.dev.unified.val %>'
                }
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
                getPattern('<%= appConfig.deployment.origin.prod.tagcade.apiEndPoint %>'),
                getUnifiedPattern('<%= appConfig.deployment.origin.prod.unified.apiEndPoint %>'),
                {
                    match: '<%= appConfig.deployment.origin.dev.tagcade.match %>',
                    replacement:  '<%= appConfig.deployment.origin.prod.tagcade.val %>'
                },
                {
                    match: '<%= appConfig.deployment.origin.dev.unified.match %>',
                    replacement:  '<%= appConfig.deployment.origin.prod.unified.val %>'
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
                    '<%= appConfig.dirs.build.prodWhiteLabel %>/app*.js'
                ]
            }
        ]
    };
    return config;
};