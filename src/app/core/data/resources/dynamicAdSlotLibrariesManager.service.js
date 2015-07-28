(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('DynamicAdSlotLibrariesManager', DynamicAdSlotLibrariesManager)
    ;

    function DynamicAdSlotLibrariesManager(Restangular) {
        var RESOURCE_NAME = 'librarydynamicadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();