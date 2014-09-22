angular.module('tagcade.tagManagement.tagGenerator')

    .controller('TagGeneratorController', function ($scope, $location, siteList, site, jstags) {
        'use strict';

        $scope.site = site;
        $scope.siteList = siteList;

        $scope.jstags = jstags;

        $scope.selectSite = function (site, siteId) {
            $scope.jstags = null;

            site.customGET('jstags').then(function (javascriptTags) {
                $scope.jstags = javascriptTags;

                // change siteId parameter on the current state without reloading
                // reloadOnSearch: false set on the state
                $location.search({ siteId: siteId });
            });
        };
    })

;