(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('SegmentManager', SegmentManager)
    ;

    function SegmentManager(Restangular, Auth) {
        var RESOURCE_NAME = 'segments';

        return Restangular.service(RESOURCE_NAME);
    }
})();