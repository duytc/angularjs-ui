(function() {
    'use strict';

    angular.module('tagcade.core.router')
        .factory('urlPrefixService', urlPrefixService)
    ;

    function urlPrefixService(USER_ROLES, BASE_USER_URLS, Auth) {
        var api = {
            getPrefixedUrl: getPrefixedUrl
        };

        return api;

        /////

        function getUrlPrefixForCurrentUser() {
            var urlPrefix;

            if (Auth.isAuthorized(USER_ROLES.admin)) {
                console.log('admin');
                urlPrefix = BASE_USER_URLS.admin;
            } else if (Auth.isAuthorized(USER_ROLES.publisher)) {
                console.log('publisher');
                urlPrefix = BASE_USER_URLS.publisher;
            } else if (Auth.isAuthorized(USER_ROLES.subPublisher)) {
                console.log('subPublisher');
                urlPrefix = BASE_USER_URLS.subPublisher;
            }

            return urlPrefix;
        }

        function getPrefixedUrl(url) {
            if (url.indexOf('/') !== 0) {
                url = '/' + url;
            }

            return getUrlPrefixForCurrentUser() + url;
        }
    }
})();