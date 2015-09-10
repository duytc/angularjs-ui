(function() {
    'use strict';

    angular.module('tagcade.tagManagement.tagGenerator')
        .controller('TagGenerator', TagGenerator)
    ;

    function TagGenerator($scope, $location, $q, siteList, site, jstags, publishers) {
        $scope.formProcessing = false;

        $scope.selected = {
            publisher: site && site.publisher,
            site: site
        };

        $scope.keywordGuide = {
            header : 'Copy and paste the following tag into the <head> section of your website.',
            passback: 'Give the following tag to your ad networks as a passback/default/fallback tag for display ads.',
            adSlot : 'Copy and paste the following ad tags into the <body> section of your website.'
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

        $scope.exportTags = function(jstags) {
            var tagsString = _tagsString(jstags);

            var blob = new Blob([tagsString], {type: "text/plain;charset=utf-8"});
            var domain = $scope.selected.site.domain.substring(7);
            return saveAs(blob, [domain  + '-tags.txt']);
        };

        function _tagsString(jstags) {
            var tags = 'HEADER' + '\n#' + $scope.keywordGuide.header + _downLine('=') + jstags.header + _downLine();

            angular.forEach(jstags, function(adSlotTags, name) {
                if(angular.isObject(adSlotTags)) {
                    tags = tags + _downLine('=') + name.toUpperCase() + '\n#' + $scope.keywordGuide.adSlot + _printTags(adSlotTags);
                }
            });

            return tags;
        }

        function _downLine(divider) {
            var dividers = '';
            divider = !divider ? '-' : divider;

            var i = 0;
            for(i; i < 25; i++) {
                dividers = dividers + divider;
            }

            return '\n' + dividers + '\n';
        }

        function _printTags(adSlotTags) {
            var adTags = _downLine('=');


            if(adSlotTags.passback) {
                adTags = adTags + 'Passback' + '\n#' + $scope.keywordGuide.passback + _downLine() + adSlotTags.passback + _downLine();
            }

            angular.forEach(adSlotTags.ad_slots, function(tag, name) {
                adTags = adTags + name + _downLine() + tag + _downLine();
            });

            return adTags;
        }
    }
})();