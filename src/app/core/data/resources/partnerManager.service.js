(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('PartnerManager', PartnerManager)
    ;

    function PartnerManager(Restangular, Auth) {
        var RESOURCE_NAME = 'partners';

        return Restangular.service(RESOURCE_NAME);
    }
})();