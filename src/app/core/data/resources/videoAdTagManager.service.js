(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VideoAdTagManager', VideoAdTagManager)
    ;

    function VideoAdTagManager(Restangular, Auth) {
        var RESOURCE_NAME = 'videowaterfalltags';

        return Restangular.service(RESOURCE_NAME);
    }
})();