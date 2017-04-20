(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('BlockListManager', BlockListManager)
    ;

    function BlockListManager(Restangular, Auth) {
        var RESOURCE_NAME = 'displayblacklists';

        return Restangular.service(RESOURCE_NAME);
    }
})();