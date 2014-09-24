angular.module('tagcade.tagManagement.tagGenerator')

    .controller('TagGeneratorController', function ($scope, $location, SiteManager, siteList, site, jstags, publishers) {
        'use strict';

        $scope.publisherFilterCriteria = null;

        $scope.selected = {
            publisher: site && site.publisher,
            site: site
        };

        $scope.siteList = siteList;
        $scope.jstags = jstags;

        $scope.allowPublisherSelection = $scope.currentUser.isAdmin() && !!publishers;
        $scope.publisher = null;
        $scope.publishers = publishers;

        $scope.selectPublisher = function (publisher, publisherId) {
            $scope.jstags = null;
            $scope.selected.site = null;

            $scope.publisherFilterCriteria = {
                publisher: {
                    id: publisherId
                }
            };
        };

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