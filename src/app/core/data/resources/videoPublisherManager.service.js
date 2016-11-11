(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VideoPublisherManager', VideoPublisherManager)
    ;

    function VideoPublisherManager(Restangular, Auth) {
        var RESOURCE_NAME = 'videopublishers';

        return Restangular.service(RESOURCE_NAME);
    }
})();