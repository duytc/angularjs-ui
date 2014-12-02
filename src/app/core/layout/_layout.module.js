(function () {
    'use strict';

    angular.module('tagcade.core.layout', [
        'ui.bootstrap',
        'ui.select'
    ])
        .config(function(uiSelectConfig) {
            uiSelectConfig.theme = 'bootstrap';
        })
    ;
})();