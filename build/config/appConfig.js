module.exports = {
    dirs: {
        build: {
            dev: 'build/targets/dev',
            prod: 'build/targets/prod'
        },
        temp: 'build/temp'
    },
    appFiles: {
        js: ['src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js', '!src/app/app.js', '!src/app/bootstrap.js'],
        coreJs: ['src/app/app.js', 'src/app/bootstrap.js'],
        tests: ['src/**/*.spec.js'],
        appTemplates: ['src/app/**/*/*.tpl.html'],
        commonTemplates: ['src/common/**/*/*.tpl.html'],
        scss: ['src/styles/ui/**/*.scss'],
        css: [],
        html: ['src/index.html']
    },
    vendorFiles: {
        js: [
            'vendor/jquery/dist/jquery.min.js',
            'vendor/jquery-ui/jquery-ui.min.js',
            'vendor/angular/angular.js',
            'vendor/angular-deferred-bootstrap/angular-deferred-bootstrap.js',
            'vendor/angular-underscore-module/angular-underscore-module.js',
            'vendor/angular-animate/angular-animate.min.js',
            'vendor/angular-sanitize/angular-sanitize.min.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/angular-ui-sortable/sortable.min.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'vendor/lodash/dist/lodash.min.js',
            'vendor/restangular/dist/restangular.min.js',
            'vendor/moment/min/moment.min.js',
            'vendor/angular-moment/angular-moment.min.js',
            'vendor/ng-table/ng-table.min.js',
            'vendor/angular-ui-select/dist/select.min.js',
            'vendor/bootstrap-daterangepicker/daterangepicker.js',
            'vendor/angular-daterangepicker/js/angular-daterangepicker.js',
            'vendor/angular-loading-bar/build/loading-bar.min.js',
            'vendor/angular-httpi/lib/httpi.js'
        ],
        css: [
            'src/styles/customvendor/**/*.css'
        ]
    }
};