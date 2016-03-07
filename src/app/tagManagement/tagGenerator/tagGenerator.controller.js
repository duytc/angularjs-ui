(function() {
    'use strict';

    angular.module('tagcade.tagManagement.tagGenerator')
        .controller('TagGenerator', TagGenerator)
    ;

    function TagGenerator($scope, $translate, $location, $q, siteList, site, jstags, publishers, SiteManager, adminUserManager, accountManager, Auth, USER_MODULES) {
        $scope.formProcessing = false;
        $scope.jstagCopy = angular.copy(jstags);

        $scope.typeKey = {
            passback: 'passback',
            header: 'header',
            adSlot: 'adSlot',
            ronAdSlot: 'ronAdSlot'
        };

        $scope.types = [
            {
                key: $scope.typeKey.passback,
                label: 'Universal Passback'
            },
            {
                key: $scope.typeKey.header,
                label: 'Header'
            },
            {
                key: $scope.typeKey.adSlot,
                label: 'Ad Slot'
            }
        ];

        if(!$scope.isSubPublisher()) {
            $scope.types.push({
                key: $scope.typeKey.ronAdSlot,
                label: 'RON Ad Slot'
            })
        }

        $scope.selected = {
            type: !!site ? $scope.typeKey.adSlot : $scope.typeKey.passback,
            publisher: site && site.publisher,
            site: site,
            adSlotType: null
        };

        $scope.typeSelected = !!site ? $scope.typeKey.adSlot : $scope.typeKey.passback;
        $scope.selectedSegmentModel = $translate.instant('SEGMENT_MODULE.GLOBAL_REPORT_SEGMENT');

        $scope.keywordGuide = {
            header : $translate.instant('TAG_GENERATOR_MODULE.GUIDE_COPY_HEADER'),
            adSlot : $translate.instant('TAG_GENERATOR_MODULE.GUIDE_COPY_BODY'),
            passback: $translate.instant('TAG_GENERATOR_MODULE.GUIDE_PASSBACK')
        };

        $scope.siteList = siteList;
        $scope.jstags = jstags;

        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;
        $scope.publisher = null;
        $scope.publishers = publishers;

        $scope.isFormValid = function() {
            return $scope.tagGeneratorForm.$valid;
        };

        $scope.selectPublisher = function () {
            $scope.selected.site = null;
        };

        $scope.selectType = function() {

        };

        $scope.selectSite = function (site, siteId) {
        };

        $scope.getTextToCopy = function(string) {
            if (navigator.appVersion.indexOf("Win") != -1) {
                return string.replace(/\n/g, '\r\n');
            }

            return string;
        };

        $scope.convertSegmentArr = function(segment){
            var global = $translate.instant('SEGMENT_MODULE.GLOBAL_REPORT_SEGMENT');

            if(!segment) return [global];

            var segmentKey = Object.keys(segment);
            segmentKey.unshift(global);

            return segmentKey
        };

        $scope.selectSegment = function(type, tag, adSlot, index){
            if(type == $translate.instant('SEGMENT_MODULE.GLOBAL_REPORT_SEGMENT')){
                tag.jstag = adSlot[index].jstag;
            }
            else {
                tag.jstag = tag.segments[type];
            }
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.jstags = null;

            var getJsTagsPromise;

            getJsTagsPromise = getJsTags();

            $q.when(getJsTagsPromise)
                .then(function (javascriptTags) {
                    $scope.jstags = javascriptTags;
                    $scope.jstagCopy = angular.copy(javascriptTags);

                    $scope.typeSelected = $scope.selected.type;

                    if($scope.selected.type == $scope.typeKey.adSlot) {
                        var site = $scope.selected.site;

                        // change siteId parameter on the current state without reloading
                        // reloadOnSearch: false set on the state
                        $location.search({ siteId: site.id });
                    }
                    else {
                        $location.search({ siteId: null });
                    }
                })
                .finally(function () {
                    $scope.formProcessing = false;
                })
            ;
        };

        $scope.filterByAnalytics = function(type) {
            if(!$scope.isAdmin() && type.key == $scope.typeKey.header && Auth.getSession().enabledModules.indexOf(USER_MODULES.analytics) == -1) {
                return false
            }

            return true;
        };

        $scope.exportTags = function(jstags) {
            var tagsString = null;
            if($scope.typeSelected != $scope.typeKey.passback) {
                tagsString = _tagsAdSlotString(jstags);
            }
            else {
                tagsString = _tagsPassbackString(jstags);
            }

            var blob = new Blob([tagsString], {type: "text/plain;charset=utf-8"});
            var name = null;

            if($scope.typeSelected == $scope.typeKey.adSlot || $scope.typeSelected == $scope.typeKey.header) {
                name = $scope.selected.site.domain;
            }
            else if($scope.typeSelected == $scope.typeKey.passback) {
                name = 'Universal Passback';
            }
            else {
                name = 'RON ad slot';
            }

            return saveAs(blob, [name  + '-tags.txt']);
        };

        function getJsTags() {
            if($scope.selected.type == $scope.typeKey.adSlot) {
                var site = $scope.selected.site;

                return site.customGET('jstags');
            }

            if ($scope.selected.type == $scope.typeKey.passback) {
                if($scope.isAdmin()) {
                    return adminUserManager.one($scope.selected.publisher.id).customGET('jspassback');
                } else {
                    return accountManager.one().customGET('jspassback')
                }
            }

            if ($scope.selected.type == $scope.typeKey.header) {
                return SiteManager.one($scope.selected.site.id).customGET('jsheadertag');
            }

            if($scope.isAdmin()) {
                return adminUserManager.one($scope.selected.publisher.id).customGET('ronjstags');
            } else {
                return accountManager.one().customGET('ronjstags')
            }
        }

        function _tagsAdSlotString(jstags) {
            var tags = '';

            if(!!jstags.header && $scope.typeSelected == $scope.typeKey.header) {
                tags = 'HEADER' + '\n#' + $scope.keywordGuide.header + _downLine('=') + jstags.header + _downLine();
            }

            angular.forEach(jstags, function(adSlotTags, name) {
                if(angular.isObject(adSlotTags)) {
                    tags = tags + _downLine('=') + name.toUpperCase() + '\n#' + $scope.keywordGuide.adSlot + _printTags(adSlotTags);
                }
            });

            return tags;
        }

        function _tagsPassbackString(jstags) {
            return 'Passback' + '\n#' + $scope.keywordGuide.passback + _downLine() + jstags.passback + _downLine();
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

            angular.forEach(adSlotTags.ad_slots, function(tag) {
                adTags = adTags + tag.name + _downLine() + tag.jstag + _downLine();

                if(!!tag.segments) {
                    adTags = adTags + 'For Report Segment ' + tag.name + _downLine('=');

                    angular.forEach(tag.segments, function(segment, name) {
                        adTags = adTags + name + _downLine() + segment + _downLine();
                    })
                }
            });

            return adTags;
        }
    }
})();