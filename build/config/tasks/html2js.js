module.exports = {
    options: {
        htmlmin: {
            collapseWhitespace: true
        }
    },

    app: {
        options: {
            base: 'src/app'
        },
        src: ['<%= appConfig.appFiles.appTemplates %>'],
        dest: '<%= appConfig.dirs.temp %>/templates/templates-app.js'
    },

    common: {
        options: {
            base: 'src/common'
        },
        src: ['<%= appConfig.appFiles.commonTemplates %>'],
        dest: '<%= appConfig.dirs.temp %>/templates/templates-common.js'
    }
};