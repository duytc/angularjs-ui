(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VideoDemandAdTagManager', VideoDemandAdTagManager)
    ;

    function VideoDemandAdTagManager (Restangular) {
        var RESOURCE_NAME = 'videodemandadtags';

        return Restangular.service(RESOURCE_NAME);
    }
})();