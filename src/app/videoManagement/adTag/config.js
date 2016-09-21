(function() {
    'use strict';

    angular.module('tagcade.videoManagement.adTag')
        .constant('STRATEGY_OPTION', [
            {key: 'parallel', label: 'Parallel'},
            {key: 'linear', label: 'Linear'}
        ])
        .constant('PLATFORM_OPTION', [
            {key: 'flash', label: 'Flash'},
            {key: 'js', label: 'Javascript'}
        ])
    ;
})();