module.exports = {
    dirs: {
        build: {
            dev: 'build/targets/dev',
            prod: 'build/targets/prod'
        },
        temp: 'build/temp'
    },
    appFiles: {
        js: ['src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'],
        tests: ['src/**/*.spec.js'],
        appTemplates: ['src/app/**/*.tpl.html'],
        commonTemplates: ['src/common/**/*.tpl.html'],
        scss: ['src/styles/**/*.scss'],
        html: ['src/index.html']
    },
    vendorFiles: {
        js: [
            'vendor/jquery/dist/jquery.min.js',
            'vendor/angular/angular.js',
            'vendor/angular-animate/angular-animate.min.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'vendor/lodash/dist/lodash.min.js',
            'vendor/restangular/dist/restangular.min.js'
        ],
        css: []
    }
};