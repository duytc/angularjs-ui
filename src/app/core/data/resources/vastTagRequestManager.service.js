(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VastTagRequestManager', VastTagRequestManager)
    ;

    function VastTagRequestManager (Restangular) {
        var RESOURCE_NAME = 'vasttagrequests';

        return Restangular.service(RESOURCE_NAME);
    }
})();