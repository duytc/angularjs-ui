(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VideoAdTagItemManager', VideoAdTagItemManager)
    ;

    function VideoAdTagItemManager(Restangular, Auth) {
        var RESOURCE_NAME = 'videowaterfalltagitems';

        return Restangular.service(RESOURCE_NAME);
    }
})();