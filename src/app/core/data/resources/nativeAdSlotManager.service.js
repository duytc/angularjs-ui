(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('NativeAdSlotManager', NativeAdSlotManager)
    ;

    function NativeAdSlotManager(Restangular) {
        var RESOURCE_NAME = 'nativeadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();