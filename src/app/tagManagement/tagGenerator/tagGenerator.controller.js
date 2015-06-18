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

        $scope.editorOptions = {
            lineWrapping : true,
            indentUnit: 0,
            mode : "htmlmixed"
        };

        $scope.refresh = false;
        $scope.selectTab = function() {
            $scope.refresh = false;

            $timeout(function() {
                $scope.refresh = true;
            })
        };

        $scope.isFormValid = function() {
            return $scope.tagGeneratorForm.$valid;
        };

        $scope.selectPublisher = function (publisher, publisherId) {
            $scope.selected.site = null;
        };

        $scope.selectSite = function (site, siteId) {
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