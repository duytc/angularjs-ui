(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AdSlotAdTagLibrariesManager', AdSlotAdTagLibrariesManager)
    ;

    function AdSlotAdTagLibrariesManager(Restangular) {
        var RESOURCE_NAME = 'libraryslottags';

        return Restangular.service(RESOURCE_NAME);
    }
})();