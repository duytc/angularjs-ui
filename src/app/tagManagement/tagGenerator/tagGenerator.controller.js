(function() {
    'use strict';

    angular.module('tagcade.tagManagement.tagGenerator')
        .controller('TagGenerator', TagGenerator)
    ;

    function TagGenerator($scope, $translate, $location, $q, channelList, site, channel, jstags, publishers, SiteManager, ChannelManager, adminUserManager, accountManager, userSession, Auth, USER_MODULES) {
        $scope.formProcessing = false;
        $scope.jstagCopy = angular.copy(jstags);
        var totalRecord = null;

        $scope.typeKey = {
            passback: 'passback',
            header: 'header',
            adSlot: 'adSlot',
            ronAdSlot: 'ronAdSlot'
        };

        $scope.generatorOptions = [
            {
                label: 'Site',
                key: 'site'
            },
            {
                label: 'Channel',
                key: 'channel'
            }
        ];

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
            type: !!site || !!channel ? $scope.typeKey.adSlot : $scope.typeKey.passback,
            publisher: site && site.publisher || channel && channel.publisher,
            generatorFor: !!channel ? 'channel' : 'site',
            site: site,
            channel: channel,
            adSlotType: null,
            forceSecure: true
        };

        $scope.typeSelected = !!site || !!channel ? $scope.typeKey.adSlot : $scope.typeKey.passback;
        $scope.selectedSegmentModel = $translate.instant('SEGMENT_MODULE.GLOBAL_REPORT_SEGMENT');

        $scope.keywordGuide = {
            header : $translate.instant('TAG_GENERATOR_MODULE.GUIDE_COPY_HEADER'),
            adSlot : $translate.instant('TAG_GENERATOR_MODULE.GUIDE_COPY_BODY'),
            passback: $translate.instant('TAG_GENERATOR_MODULE.GUIDE_PASSBACK')
        };

        $scope.siteList = [];
        $scope.channelList = channelList;
        $scope.jstags = jstags;

        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;
        $scope.publishers = publishers;

        $scope.isFormValid = function() {
            return $scope.tagGeneratorForm.$valid;
        };

        $scope.selectPublisher = function (publisher) {
            $scope.selected.site = null;
            $scope.selected.channel = null;

            params.publisherId = publisher.id;
            searchItem();
        };

        $scope.selectType = function(type) {
            if(type.key == 'header') {
                $scope.selected.generatorFor = 'site';
            }
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
                        var channel = $scope.selected.channel;

                        // change siteId parameter on the current state without reloading
                        // reloadOnSearch: false set on the state
                        if(!!site) {
                            $location.search({ siteId: site.id});
                        }
                        if(!!channel) {
                            $location.search({channelId: channel.id });
                        }
                    }
                    else {
                        $location.search({ siteId: null, channelId: null });
                    }
                })
                .finally(function () {
                    $scope.formProcessing = false;
                })
            ;
        };

        $scope.hasDisplayAdsModuleAndSecure = function () {
            if(!$scope.selected.publisher && $scope.isAdmin()) {
                return false;
            }

            if($scope.isAdmin()) {
                return $scope.selected.publisher.enabledModules.indexOf(USER_MODULES.displayAds) > -1 && ($scope.selected.publisher.tagDomain.length == 0 || !$scope.selected.publisher.tagDomain || !!$scope.selected.publisher.tagDomain.secure)
            } else {
                return userSession.enabledModules.indexOf(USER_MODULES.displayAds) > -1 && (userSession.tagDomain.length == 0 || !userSession.tagDomain || !!userSession.tagDomain.secure)
            }

            return false;
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
                tagsString = _tagsPassbackString(jstags) ;
            }

            var blob = new Blob([tagsString], {type: "text/plain;charset=utf-8"});
            var name = null;
            var lastNameFile = '-tags.txt';

            if($scope.typeSelected == $scope.typeKey.adSlot) {
                lastNameFile = '-tags.txt';

                if($scope.selected.generatorFor == 'site') {
                    name = 'site-' + $scope.selected.site.domain;
                } else {
                    name = 'channel-' + $scope.selected.channel.name;
                }
            }
            else if($scope.typeSelected == $scope.typeKey.header) {
                name = 'header-' + $scope.selected.site.domain;
            }
            else if($scope.typeSelected == $scope.typeKey.passback) {
                name = 'Universal Passback';
            }
            else {
                lastNameFile = '-tags.txt';
                name = 'RON ad slot';
            }

            return saveAs(blob, [name  + lastNameFile]);
        };

        function getJsTags() {
            if($scope.selected.type == $scope.typeKey.adSlot) {
                if($scope.selected.generatorFor == 'channel') {
                    var channel = $scope.selected.channel;

                    return ChannelManager.one(channel.id).customGET('jstags', {forceSecure: $scope.selected.forceSecure});
                }

                var site = $scope.selected.site;
                return SiteManager.one(site.id).customGET('jstags', {forceSecure: $scope.selected.forceSecure});
            }

            if ($scope.selected.type == $scope.typeKey.passback) {
                if($scope.isAdmin()) {
                    return adminUserManager.one($scope.selected.publisher.id).customGET('jspassback', {forceSecure: $scope.selected.forceSecure});
                } else {
                    return accountManager.one().customGET('jspassback', {forceSecure: $scope.selected.forceSecure})
                }
            }

            if ($scope.selected.type == $scope.typeKey.header) {
                return SiteManager.one($scope.selected.site.id).customGET('jsheadertag', {forceSecure: $scope.selected.forceSecure});
            }

            if($scope.isAdmin()) {
                return adminUserManager.one($scope.selected.publisher.id).customGET('ronjstags', {forceSecure: $scope.selected.forceSecure});
            } else {
                return accountManager.one().customGET('ronjstags', {forceSecure: $scope.selected.forceSecure})
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

        var params = {
            query: '',
            publisherId: site && site.publisher.id
        };

        $scope.searchItem = searchItem;
        $scope.addMoreItems = addMoreItems;

        function searchItem(query) {
            if(query == params.query) {
                return;
            }

            params.page = 1;
            params.searchKey = query;

            SiteManager.one().get(params)
                .then(function(data) {
                    $scope.siteList = data.records;
                    totalRecord = data.totalRecord;
                });
        }

        function addMoreItems() {
            var page = Math.ceil(($scope.siteList.length/10) + 1);

            if(params.page === page || (page >= totalRecord/10 && page != 1)) {
                return
            }

            params.page = page;

            SiteManager.one().get(params)
                .then(function(data) {
                    angular.forEach(data.records, function(item) {
                        totalRecord = data.totalRecord;
                        $scope.siteList.push(item);
                    })
            });
        }
    }
})();