(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AdTagLibrariesManager', AdTagLibrariesManager)
    ;

    function AdTagLibrariesManager(Restangular) {
        var RESOURCE_NAME = 'libraryadtags';

        return Restangular.service(RESOURCE_NAME);
    }
})();