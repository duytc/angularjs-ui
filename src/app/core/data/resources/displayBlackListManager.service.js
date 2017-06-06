(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('DisplayBlackListManager', DisplayBlackListManager)
    ;

    function DisplayBlackListManager(Restangular, Auth) {
        var RESOURCE_NAME = 'displayblacklists';

        return Restangular.service(RESOURCE_NAME);
    }
})();