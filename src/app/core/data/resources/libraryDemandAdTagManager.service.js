(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('LibraryDemandAdTagManager', LibraryDemandAdTagManager)
    ;

    function LibraryDemandAdTagManager (Restangular) {
        var RESOURCE_NAME = 'libraryvideodemandadtags';

        return Restangular.service(RESOURCE_NAME);
    }
})();