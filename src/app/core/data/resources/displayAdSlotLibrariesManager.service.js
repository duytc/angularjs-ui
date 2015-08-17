(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('DisplayAdSlotLibrariesManager', DisplayAdSlotLibrariesManager)
    ;

    function DisplayAdSlotLibrariesManager(Restangular) {
        var RESOURCE_NAME = 'librarydisplayadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();