module.exports = {
    html: '<%= appConfig.dirs.build.dev %>/index.html',
    options: {
        dest: '<%= appConfig.dirs.build.prod %>',
        staging: '<%= appConfig.dirs.temp %>',
        flow: {
            steps: {
                js: ['concat', 'uglifyjs'],
                css: ['concat', 'cssmin']
            },
            post: {
                js: [{
                    name: 'uglify',
                    createConfig: function (context, block) {
                        var generated = context.options.generated;
                        generated.options = {
//                                beautify : true,
                            mangle   : false,
                            compress: {
                                drop_console: true
                            }
                        };
                    }
                }]
            }
        }
    }
};