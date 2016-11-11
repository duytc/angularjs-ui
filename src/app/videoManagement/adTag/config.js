(function() {
    'use strict';

    angular.module('tagcade.videoManagement.adTag')
        .constant('STRATEGY_OPTION', [
            {key: 'parallel', label: 'Parallel'},
            {key: 'linear', label: 'Linear'}
        ])
        .constant('PLATFORM_OPTION', [
            {key: 'flash', label: 'Flash VPAID'},
            {key: 'js', label: 'HTML/JS VPAID'}
        ])
        .constant('PLATFORM_VAST_TAG', [
            {key: 'html5', label: 'HTML/JS VPAID'},
            {key: 'flash', label: 'Flash VPAID'},
            {key: 'auto', label: 'Auto-Detect'}
        ])
    ;
})();