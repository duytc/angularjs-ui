(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('DisplayAdSlotManager', DisplayAdSlotManager)
    ;

    function DisplayAdSlotManager(Restangular) {
        var RESOURCE_NAME = 'displayadslots';

        return Restangular.service(RESOURCE_NAME);
    }
})();