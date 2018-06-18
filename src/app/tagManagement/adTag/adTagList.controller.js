(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagList', AdTagList)
    ;

    function AdTagList($scope, _, $stateParams, $translate, $q, $state, $modal, adTags, adSlot, segments, AdTagManager, AdSlotAdTagLibrariesManager, AdTagLibrariesManager, DisplayAdSlotManager, AutoOptimizeIntegrationManager, AlertService, historyStorage, userSession, USER_MODULES, HISTORY_TYPE_PATH, AD_TYPES, TYPE_AD_SLOT, COUNTRY_LIST) {
        $scope.adTags = adTags;
        $scope.adSlot = adSlot;

        $scope.hasAutoOptimizeModule = userSession.hasModuleEnabled(USER_MODULES.autoOptimize);

        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        if(!!adSlot.libraryAdSlot && adSlot.libraryAdSlot.visible || adSlot.visible) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_SLOT_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
            });
        }

        if (!$scope.hasAdTags()) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_TAG_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        var originalGroups;
        $scope.enableShowOptimizedPositions = false;
        $scope.enableDragDrop = false;

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.adTypes = AD_TYPES;
        $scope.adSlot = adSlot;
        $scope.adTagsGroup = _sortGroup($scope.adTags);

        /*
         * [
         *   {
         *     "key": "country",
         *     "label": "country"
         *   }
         * ]
         */
        $scope.segments = segments || [];
        var DEFAULT_DOMAINS = ['All Domains'];
        $scope.domains = DEFAULT_DOMAINS; // update later due to selected segment

        $scope.countries = angular.copy(COUNTRY_LIST);
        var mostCommonlyCountry = [
            {name: 'Australia', code: 'AU', line: true},
            {name: 'Canada', code: 'CA', line: true},
            {name: 'United Kingdom', code: 'GB', line: true},
            {name: 'United States', code: 'US', line: true}
        ];

        angular.forEach($scope.countries, function (country, index) {
            angular.forEach(mostCommonlyCountry, function (mostCommonly) {
                if (country && country.code && mostCommonly.code == country.code) {
                    delete $scope.countries[index];
                    $scope.countries.unshift(mostCommonly);
                }
            })
        });

        // add 'global' to top of countries list
        $scope.countries.unshift({name: 'All Countries', code: 'All Countries', line: true});

        $scope.selected = {
            segments: [],
            country: null,
            domain: null
        };

        $scope.optimizedPositions = null;

        $scope.$watch(function () {
            return $scope.selected.segments
        }, _onSegmentsChange);

        $scope.$watch(function () {
            return $scope.selected.country
        }, _onSelectedCountryChange);

        $scope.$watch(function () {
            return $scope.selected.domain
        }, _onSelectedDomainChange);

        $scope.actionDropdownToggled = actionDropdownToggled;
        $scope.updateAdTag = updateAdTag;
        $scope.enableDragDropAdTag = enableDragDropAdTag;
        $scope.backToListAdSlot = backToListAdSlot;
        $scope.shareAdTag = shareAdTag;
        $scope.showOptimizedPositions = showOptimizedPositions;
        $scope.selectCountry = selectCountry;
        $scope.selectDomain = selectDomain;
        $scope.isAutoOptimize = isAutoOptimize;
        $scope.isShowCountrySelect = isShowCountrySelect;
        $scope.isShowDomainInput = isShowDomainInput;
        $scope.groupEntities = groupEntities;
        $scope.getMoreSegmentDomains = getMoreSegmentDomains;
        $scope.searchSegmentDomain = searchSegmentDomain;

        $scope.optimizeNow = optimizeNow;

        $scope.sortableGroupOptions = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder-group',
            stop: _stop,
            start: _start
        };

        $scope.sortableItemOption = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: "sortable-placeholder-item",
            connectWith: ".itemAdTag",
            stop: _stop,
            start: _start
        };

        function optimizeNow() {
            AutoOptimizeIntegrationManager.one(adSlot.optimizationIntegration).get()
                .then(function (integration) {
                    AutoOptimizeIntegrationManager.one(integration.id).one('optimizenow').get()
                        .then(function () {
                                if (integration.optimizationAlerts === "notifyMeBeforeMakingChange") {
                                    AlertService.replaceAlerts({
                                        type: 'success',
                                        message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.OPTIMIZE_NOW_MESSAGE')
                                    });
                                }else {
                                    AlertService.replaceAlerts({
                                        type: 'success',
                                        message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.OPTIMIZATION_UPDATED')
                                    });
                                    if($scope.enableShowOptimizedPositions){
                                        _getOptimizedTags();
                                    }
                                }
                            },
                            function (err) {
                                AlertService.replaceAlerts({
                                    type: 'error',
                                    message: err.data.message
                                });
                            })
                });
        }

        $scope.unLinkAdTag = function (adTag) {
            var Manager = AdTagManager.one(adTag.id).one('unlink').patch();
            Manager
                .then(function () {
                    adTag.libraryAdTag.visible = false;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UNLINK_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UNLINK_FAIL')
                    });
                })
            ;
        };

        $scope.splitFromGroup = function(group, adTag) {
            angular.forEach(group, function(item, index) {
               if(item.id == adTag.id) {
                   group.splice(index, 1);
               }
            });

            originalGroups = angular.copy($scope.adTagsGroup);

            var adTagGroup = [];
            adTagGroup.push(adTag);
            $scope.adTagsGroup.splice(adTag.position, 0 , adTagGroup);

            return _stop();
        };

        $scope.toggleAdTagStatus = function (adTag) {
            var newTagStatus = !adTag.active;

            var Manager = !!adTag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;
            Manager.one(adTag.id).patch({
                'active': newTagStatus
            })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.CHANGE_STATUS_FAIL')
                    });

                    return $q.reject($translate.instant('AD_TAG_MODULE.CHANGE_STATUS_FAIL'));
                })
                .then(function () {
                    // update status for tag in current shown list
                    adTag.active = newTagStatus;

                    // update status in initial ad tag list
                    angular.forEach(adTags, function (t) {
                        if (t.id !== adTag.id) {
                            return;
                        }

                        t.active = adTag.active;
                    });
                })
            ;
        };

        $scope.toggleAdTagPassback = function (adTag) {
            var newTagPassback = !adTag.passback;

            var Manager = !!adTag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;
            Manager.one(adTag.id).patch({
                'passback': newTagPassback
            })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: !newTagPassback ? $translate.instant('AD_TAG_MODULE.UNMARK_PASSBACK_FAIL') : $translate.instant('AD_TAG_MODULE.MARK_PASSBACK_FAIL')
                    });

                    return $q.reject(!newTagPassback ? $translate.instant('AD_TAG_MODULE.UNMARK_PASSBACK_FAIL') : $translate.instant('AD_TAG_MODULE.MARK_PASSBACK_FAIL'));
                })
                .then(function () {
                    adTag.passback = newTagPassback;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: !newTagPassback ? $translate.instant('AD_TAG_MODULE.UNMARK_PASSBACK_SUCCESS') : $translate.instant('AD_TAG_MODULE.MARK_PASSBACK_SUCCESS')
                    });
                })
            ;
        };

        $scope.toggleAdTagPin = function (adTag) {
            var newTagPin = !adTag.pin;

            AdTagManager.one(adTag.id).patch({
                'pin': newTagPin
            })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: !newTagPin ? $translate.instant('AD_TAG_MODULE.UNPIN_FAIL') : $translate.instant('AD_TAG_MODULE.PIN_FAIL')
                    });

                    return $q.reject(!newTagPin ? $translate.instant('AD_TAG_MODULE.UNPIN_FAIL') : $translate.instant('AD_TAG_MODULE.PIN_FAIL'));
                })
                .then(function () {
                    adTag.pin = newTagPin;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: !newTagPin ? $translate.instant('AD_TAG_MODULE.UNPIN_SUCCESS') : $translate.instant('AD_TAG_MODULE.PIN_SUCCESS')
                    });
                })
            ;
        };

        // called when an action dropdown is opened/closed
        // we disable drag and drop sorting when it is open
        function actionDropdownToggled(isOpen) {
            if($scope.enableDragDrop) {
                $scope.sortableItemOption['disabled'] = isOpen;
                $scope.sortableGroupOptions['disabled'] = isOpen;

                setTimeout(function() {
                    $scope.$apply()
                }, 0)
            }
        }

        $scope.confirmDeletion = function (adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var Manager = !!adTag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;

                return Manager.one(adTag.id).remove()
                    .then(function () {
                        var state = !!adTag.libraryAdSlot ? '^.displayList' : '^.list';
                        $state.go(state, {uniqueRequestCacheBuster: Math.random(), adSlotId: $scope.adSlot.id});

                        AlertService.addFlash({
                            type: 'success',
                            message: $translate.instant('AD_TAG_MODULE.DELETE_SUCCESS')
                        });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: $translate.instant('AD_TAG_MODULE.DELETE_FAIL')
                            });
                        }
                    )
                ;
            });
        };

        function _start() {
            originalGroups = angular.copy($scope.adTagsGroup);
        }

        function getIdsWithRespectToGroup(adTagsGroup) {
            var groupIds = [];

            angular.forEach(adTagsGroup, function(group) {
                if(group.length > 0) {
                    groupIds.push(group.map(function (adTag) {
                            return adTag.id;
                        })
                    );
                }
            });

            return groupIds;
        }

        function groupIdentical(groupOld, groupNew) {
            var i = groupOld.length;
            if (i != groupNew.length) return false;
            var adTagsOld;
            var adTagsNew;
            while (i--) {
                adTagsOld = groupOld[i];
                adTagsNew = groupNew[i];

                if (!arraysIdentical(adTagsOld, adTagsNew)) return false;
            }

            return true;
        }

        function arraysIdentical(a, b) {
            var i = a.length;
            if (i != b.length) return false;
            while (i--) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }

        // handle event drag & drop
        function _stop() {
            var groupIds = getIdsWithRespectToGroup($scope.adTagsGroup);
            var originalGroupIds = getIdsWithRespectToGroup(originalGroups);

            if (groupIdentical(groupIds, originalGroupIds)) {
                return;
            }

            adSlot.all('adtags').customPOST({ ids: groupIds }, 'positions')
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.REORDERED_AD_TAG_FAIL')
                    });

                    return $q.reject($translate.instant('AD_TAG_MODULE.REORDERED_AD_TAG_FAIL'));
                })
                .then(function (data) {
                    actionDropdownToggled(false);

                    $scope.adTags = data.plain();
                    adTags = $scope.adTags;
                    $scope.adTagsGroup = _sortGroup(adTags);

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.REORDERED_AD_TAG_SUCCESS')
                    });
                })
            ;
        }

        //sort groups overlap position
        function _sortGroup(listAdTags) {
            var adTagsGroup = [];
            console.log(listAdTags);
            // current we do not support group for auto optimization
            // TODO: if API support tags same points are in same group, we need change here...
            if ($scope.enableShowOptimizedPositions) {
                adTagsGroup = angular.copy(listAdTags);

                return adTagsGroup;
            }

            angular.forEach(listAdTags, function (item) {
                var index = 0;

                if (adTagsGroup.length == 0) {
                    adTagsGroup[index] = [];
                }
                else {
                    var found = false;
                    angular.forEach(adTagsGroup, function (group, indexGroup) {
                        if (group[0].position == item.position && !found) {
                            found = true;
                            index = indexGroup;
                        }
                    });

                    if (found == false) {
                        index = adTagsGroup.length;
                        adTagsGroup[index] = [];
                    }
                }

                adTagsGroup[index].push(item);
            });

            console.log(adTagsGroup);
            return adTagsGroup;
        }

        function updateAdTag(data, field, adtag) {
            adtag.libraryAdTag.adNetwork = adtag.libraryAdTag.adNetwork.id ? adtag.libraryAdTag.adNetwork.id : adtag.libraryAdTag.adNetwork;

            if(adtag[field] == data) {
                return;
            }

            var item = {};
            item[field] = data;

            var Manager = !!adtag.libraryAdSlot ? AdSlotAdTagLibrariesManager : AdTagManager;
            Manager.one(adtag.id).patch(item)
                .then(function() {
                    adtag[field] = data;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    adtag[field] = adtag[field];

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_FAIL')
                    });
                });
        }

        function enableDragDropAdTag(enable) {
            $scope.enableDragDrop = !enable;

            $scope.sortableItemOption['disabled'] = enable;
            $scope.sortableGroupOptions['disabled'] = enable;
        }

        function backToListAdSlot() {
            if($stateParams.from == 'smart') {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.ronAdSlot, '^.^.^.tagManagement.ronAdSlot.list');
            }

            if(!!$scope.adSlot.libType) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlotLibrary, '^.^.^.tagLibrary.adSlot.list');
            }

            var historyAdSlot = historyStorage.getParamsHistoryForAdSlot();

            //if($scope.isAdmin()) {
            //    if(!!historyAdSlot.siteId) {
            //        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list', {siteId: adSlot.site.id});
            //    } else {
            //        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
            //    }
            //}

            if(!!historyAdSlot && !!historyAdSlot.siteId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.list');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.^.adSlot.listAll');
        }

        function shareAdTag(adTag) {
            var libraryAdTag = {
                visible: true
            };

            AdTagLibrariesManager.one(adTag.libraryAdTag.id).patch(libraryAdTag)
                .then(function () {
                    adTag.libraryAdTag.visible = true;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_SUCCESS')
                    });
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.MOVED_TO_LIBRARY_FAIL')
                    });
                })
            ;
        }

        function showOptimizedPositions() {
            enableDragDropAdTag(true);
            $scope.enableShowOptimizedPositions = !$scope.enableShowOptimizedPositions;

            if ($scope.enableShowOptimizedPositions) {
                // empty ad tags list
                $scope.adTags = [];

                /* default on checked show */
                angular.forEach(segments, function (segment) {
                    segment.ticked = true;
                });

                $scope.selected.segments = segments;

                // _getOptimizedTags(); // will be called by listener on selected segments change
            } else {
                // restore original ad tags
                $scope.adTags = adTags;

                // update the shown list
                $scope.adTagsGroup = _sortGroup($scope.adTags);
            }
        }

        function selectCountry(country) {
            // do nothing
        }

        function selectDomain(domain) {
            // do nothing
        }

        function isAutoOptimize() {
            return $scope.hasAutoOptimizeModule
                && $scope.adSlot.autoOptimize;
        }

        function isShowCountrySelect() {
            return isAutoOptimize()
                && $scope.enableShowOptimizedPositions
                && _isSelectedSegment('Country', $scope.selected.segments);
        }

        function isShowDomainInput() {
            return isAutoOptimize()
                && $scope.enableShowOptimizedPositions
                && _isSelectedSegment('Domain', $scope.selected.segments);
        }

        function groupEntities(item) {
            if (item.line) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        // segment=domain&searchKey=abc&page=1&limit=10
        var paramsToGetSegmentDomains = {
            segment: 'domain',
            page: 1,
            limit: 10,
            searchKey: ''
        };

        var currentSegmentDomainsTotalRecords = 0;

        function getMoreSegmentDomains() {
            // calculate the next page
            var page = Math.ceil((($scope.domains.length - 1) / 10) + 1); // -1 because we add 'All Domains' to the top of domains

            // check if need get more domains due to current page
            if (paramsToGetSegmentDomains.page === page || !currentSegmentDomainsTotalRecords || (page > Math.ceil(currentSegmentDomainsTotalRecords / 10) && page != 1)) {
                // skip if at the last page, or could not get total records
                return;
            }

            // get segment domains for next page
            paramsToGetSegmentDomains.page = page;
            AutoOptimizeIntegrationManager.one('adslot').one($stateParams.adSlotId).one('segmentvalues').get(paramsToGetSegmentDomains)
                .then(
                    function (domains) {
                        /*
                         * {
                         *    "totalRecord":7,
                         *    "records":["abc.com", "cde.com"],
                         *    "itemPerPage":"1000",
                         *    "currentPage":"1"
                         * }
                         */
                        domains = domains.plain();
                        if (!domains || !domains.records || !domains.totalRecord) {
                            return;
                        }

                        currentSegmentDomainsTotalRecords = domains.totalRecord;

                        $scope.domains = $scope.domains.concat(domains.records);
                        $scope.domains = _.uniq($scope.domains);
                    },
                    function (error) {
                        // do nothing, keep current $scope.domains
                    }
                );
        }

        function searchSegmentDomain(search) {
            // reset params
            paramsToGetSegmentDomains.page = 1;
            paramsToGetSegmentDomains.searchKey = search;

            // get segment domains
            AutoOptimizeIntegrationManager.one('adslot').one($stateParams.adSlotId).one('segmentvalues').get(paramsToGetSegmentDomains)
                .then(
                    function (domains) {
                        /*
                         * {
                         *    "totalRecord":7,
                         *    "records":["abc.com", "cde.com"],
                         *    "itemPerPage":"1000",
                         *    "currentPage":"1"
                         * }
                         */
                        domains = domains.plain();
                        if (!domains || !domains.records || !domains.totalRecord) {
                            $scope.domains = search ? [] : ($scope.domains.length < 1 ? DEFAULT_DOMAINS : $scope.domains);
                            return;
                        }

                        currentSegmentDomainsTotalRecords = domains.totalRecord;

                        $scope.domains = search ? [].concat(domains.records) : DEFAULT_DOMAINS.concat(domains.records);
                        $scope.domains = _.uniq($scope.domains);
                    },
                    function (error) {
                        // do nothing, keep current $scope.domains
                    }
                );
        }

        /* local function ============== */
        function _onSegmentsChange(newSegments, oldSegments) {
            if ((!oldSegments && !newSegments) || (_.isEqual(angular.copy(oldSegments).sort(), angular.copy(newSegments).sort()))) {
                return;
            }

            // update domain list
            if (_isSelectedSegment('Domain', $scope.selected.segments)) {
                // reset params
                paramsToGetSegmentDomains.page = 1;
                paramsToGetSegmentDomains.searchKey = '';

                AutoOptimizeIntegrationManager.one('adslot').one($stateParams.adSlotId).one('segmentvalues').get(paramsToGetSegmentDomains)
                    .then(
                        function (domains) {
                            /*
                             * {
                             *    "totalRecord":500,
                             *    "records":["abc.com", "cde.com"],
                             *    "itemPerPage":"10",
                             *    "currentPage":"1"
                             * }
                             */
                            domains = domains.plain();
                            if (!domains || !domains.records || domains.records.length < 1 || !domains.totalRecord) {
                                $scope.domains = DEFAULT_DOMAINS;

                                // update default selected
                                $scope.selected.domain = $scope.domains[0];

                                return;
                            }

                            currentSegmentDomainsTotalRecords = domains.totalRecord;

                            $scope.domains = DEFAULT_DOMAINS.concat(domains.records);
                            $scope.domains = _.uniq($scope.domains);

                            // update default selected
                            $scope.selected.domain = $scope.domains[0];
                        },
                        function (error) {
                            $scope.domains = DEFAULT_DOMAINS;

                            // update default selected
                            $scope.selected.domain = $scope.domains[0];
                        }
                    );
            }

            if (_isSelectedSegment('Country', $scope.selected.segments)) {
                // update default selected
                $scope.selected.country = $scope.countries[0].name;
            }

            // get global optimized positions regardless the selected country and domain
            _getOptimizedTags();
        }

        function _onSelectedCountryChange() {
            if (!_isSelectedSegment('Country', $scope.selected.segments)) {
                return;
            }

            _getOptimizedTags();
        }

        function _onSelectedDomainChange() {
            if (!_isSelectedSegment('Domain', $scope.selected.segments)) {
                return;
            }

            _getOptimizedTags();
        }

        /**
         *
         * @param {string} segment
         * @param {Array|null} selectedSegments null then use $scope.selected.segments
         * @returns {boolean}
         * @private
         */
        function _isSelectedSegment(segment, selectedSegments) {
            var found = false;
            angular.forEach(selectedSegments, function (selectedSegment) {
                if (found || !selectedSegment || !selectedSegment.label) {
                    return;
                }

                if (selectedSegment.label === segment) {
                    found = true;
                }
            });

            return found;
        }

        function _getOptimizedTags() {
            $scope.optimizedPositions = [];

            /* set default */
            var selectedCountry = $scope.selected.country ? $scope.selected.country : 'All Countries';
            var selectedDomain = $scope.selected.domain ? $scope.selected.domain : 'All Domains';
            var selectedSegments = $scope.selected.segments.length > 0 ? $scope.selected.segments : segments;

            if (selectedSegments.length > 0) {
                var params = {};

                // always include country, domain (not check segments contains or not)
                params.country = selectedCountry == 'All Countries' ? 'global' : selectedCountry;
                params.domain = selectedDomain == 'All Domains' ? 'global' : selectedDomain;

                /*
                 * url: /api/v1/displayadslots/{id}/optimizedPositions?country=VN,US&domain=test.com,test2.com
                 * response:
                 * {
                 *     id: 123,
                 *     name: 'display-test-1'
                 *     autoOptimizedTags: {
                 *         domain: {
                 *             'abc.com': [1,2,3],
                 *             'bcd.com': [3,2,1]
                 *         },
                 *         country: {
                 *             'United States': [1,3,2],
                 *             'Canada': [3,2,1]
                 *         },
                 *         country.domain: {
                 *             'United States.abc.com': [1,2,3],
                 *             'Canada.bcd.com': [3,2,1]
                 *         }
                 *     }
                 * }
                 */
                DisplayAdSlotManager.one(adSlot.id).one('optimizedPositions').get(params)
                    .then(
                        function (data) {
                            $scope.adTags = _parserData(data);
                            $scope.adTagsGroup = _sortGroup($scope.adTags);
                        },
                        function (error) {
                            $scope.adTags = [];
                            $scope.adTagsGroup = _sortGroup($scope.adTags);
                        }
                    )
            } else {
                $scope.adTags = [];
                $scope.adTagsGroup = _sortGroup($scope.adTags);
            }
        }

        function _parserData(data) {
            return data;
        }
    }
})();