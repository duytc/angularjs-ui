(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('HeaderBiddingManager', HeaderBiddingManager)
    ;

    function HeaderBiddingManager (Restangular) {
        var RESOURCE_NAME = 'bidders';

        return Restangular.service(RESOURCE_NAME);
    }
})();