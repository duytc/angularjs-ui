(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VideoDemandPartnerManager', VideoDemandPartnerManager)
    ;

    function VideoDemandPartnerManager (Restangular) {
        var RESOURCE_NAME = 'videodemandpartners';

        return Restangular.service(RESOURCE_NAME);
    }
})();