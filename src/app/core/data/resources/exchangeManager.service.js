(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('ExchangeManager', ExchangeManager)
    ;

    function ExchangeManager (Restangular) {
        var RESOURCE_NAME = 'exchanges';

        return Restangular.service(RESOURCE_NAME);
    }
})();