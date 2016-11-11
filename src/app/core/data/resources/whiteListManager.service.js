(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('WhiteListManager', WhiteListManager)
    ;

    function WhiteListManager(Restangular, Auth) {
        var RESOURCE_NAME = 'whitelists';

        return Restangular.service(RESOURCE_NAME);
    }
})();