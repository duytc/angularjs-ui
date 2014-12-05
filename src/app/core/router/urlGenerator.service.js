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
                urlPrefix = BASE_USER_URLS.admin;
            } else if (Auth.isAuthorized(USER_ROLES.publisher)) {
                urlPrefix = BASE_USER_URLS.publisher;
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