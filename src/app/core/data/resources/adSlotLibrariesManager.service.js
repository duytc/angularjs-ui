(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AdSlotLibrariesManager', AdSlotLibrariesManager)
    ;

    function AdSlotLibrariesManager(Restangular) {
        var RESOURCE_NAME = 'libraryadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();