(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('VideoIVTPixelManager', VideoIVTPixelManager)
    ;

    function VideoIVTPixelManager (Restangular) {
        var RESOURCE_NAME = 'ivtpixels';

        return Restangular.service(RESOURCE_NAME);
    }
})();