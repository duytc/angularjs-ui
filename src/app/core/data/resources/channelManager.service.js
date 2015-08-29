(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('ChannelManager', ChannelManager)
    ;

    function ChannelManager(Restangular, Auth) {
        var RESOURCE_NAME = 'channels';

        return Restangular.service(RESOURCE_NAME);
    }
})();