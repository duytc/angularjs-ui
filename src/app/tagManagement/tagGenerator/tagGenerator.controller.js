(function() {
    'use strict';

    angular.module('tagcade.tagManagement.tagGenerator')
        .controller('TagGenerator', TagGenerator)
    ;

    function TagGenerator($scope, $timeout, $location, $q, siteList, site, jstags, publishers) {
        $scope.formProcessing = false;

        $scope.selected = {
            publisher: site && site.publisher,
            site: site
        };

        $scope.siteList = siteList;
        $scope.jstags = jstags;

        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;
        $scope.publisher = null;
        $scope.publishers = publishers;

        $scope.isFormValid = function() {
            return $scope.tagGeneratorForm.$valid;
        };

        $scope.selectPublisher = function (publisher, publisherId) {
            $scope.selected.site = null;
        };

        $scope.selectSite = function (site, siteId) {
        };

        $scope.getTextToCopy = function(string) {
            if (navigator.appVersion.indexOf("Win") != -1) {
                return string.replace(/\n/g, '\r\n');
            }

            return string;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.jstags = null;

            var site = $scope.selected.site;

            var getJsTagsPromise;

            try {
                getJsTagsPromise = site.customGET('jstags');
            } catch (e) {
                getJsTagsPromise = false;
            }

            $q.when(getJsTagsPromise)
                .then(function (javascriptTags) {
                    $scope.jstags = javascriptTags;

                    // change siteId parameter on the current state without reloading
                    // reloadOnSearch: false set on the state
                    $location.search({ siteId: site.id });
                })
                .finally(function () {
                    $scope.formProcessing = false;
                })
            ;
        };
    }
})();