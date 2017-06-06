(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('DisplayWhiteListManager', DisplayWhiteListManager)
    ;

    function DisplayWhiteListManager(Restangular, Auth) {
        var RESOURCE_NAME = 'displaywhitelists';

        return Restangular.service(RESOURCE_NAME);
    }
})();