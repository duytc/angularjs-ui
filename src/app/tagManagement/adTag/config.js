(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .constant('AD_TYPES', {
            customAd: 0,
            imageAd: 1
        })
        .run(function(editableOptions) {
            editableOptions.theme = 'bs3';
        });
})();