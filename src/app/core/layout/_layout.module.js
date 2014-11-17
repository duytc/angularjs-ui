(function () {
    'use strict';

    angular.module('tagcade.core.layout', [
        'ui.bootstrap',
        'ui.select',
        'ncy-angular-breadcrumb'
    ])
        .config(function(uiSelectConfig) {
            uiSelectConfig.theme = 'bootstrap';
        })

        .config(function($breadcrumbProvider) {
            $breadcrumbProvider.setOptions({
                includeAbstract: true
            });
        })
    ;
})();