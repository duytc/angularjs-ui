(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('SiteManager', SiteManager)
    ;

    function SiteManager(Restangular, Auth) {
        var RESOURCE_NAME = 'sites';

        return Restangular.service(RESOURCE_NAME);
    }
})();