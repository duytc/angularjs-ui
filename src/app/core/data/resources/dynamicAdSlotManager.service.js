(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('DynamicAdSlotManager', DynamicAdSlotManager)
    ;

    function DynamicAdSlotManager(Restangular) {
        var RESOURCE_NAME = 'dynamicadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();