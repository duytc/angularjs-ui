(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('BlackListManager', BlackListManager)
    ;

    function BlackListManager(Restangular, Auth) {
        var RESOURCE_NAME = 'blacklists';

        return Restangular.service(RESOURCE_NAME);
    }
})();