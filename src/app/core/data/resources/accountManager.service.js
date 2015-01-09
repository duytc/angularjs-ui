(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AccountManager', AccountManager)
    ;

    function AccountManager (Restangular) {
        var RESOURCE_NAME = 'accounts';

        return Restangular.service(RESOURCE_NAME);
    }
})();