(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('NativeAdSlotLibrariesManager', NativeAdSlotLibrariesManager)
    ;

    function NativeAdSlotLibrariesManager(Restangular) {
        var RESOURCE_NAME = 'librarynativeadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();