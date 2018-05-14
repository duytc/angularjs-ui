(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VideoWaterfallManager', VideoWaterfallManager)
    ;

    function VideoWaterfallManager(Restangular, Auth) {
        var RESOURCE_NAME = 'videowaterfalltags';

        return Restangular.service(RESOURCE_NAME);
    }
})();