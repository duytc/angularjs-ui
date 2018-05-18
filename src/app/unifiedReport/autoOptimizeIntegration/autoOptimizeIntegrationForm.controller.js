(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .controller('AutoOptimizeIntegrationForm', AutoOptimizeIntegrationForm)
    ;

    function AutoOptimizeIntegrationForm($scope, $filter, $translate, AlertService, optimizationRule,
                                         autoOptimizeIntegration, ServerErrorProcessor, AutoOptimizeIntegrationManager,
                                         AdSlotManager, VideoPublisherManager, VideoWaterfallManager, dataService, sites, videoPublishers, selectedSites, selectedAdSlots, historyStorage, HISTORY_TYPE_PATH,
                                         DOMAINS_LIST_SEPARATOR, COUNTRY_LIST, Auth, PLATFORM_INTEGRATION, OPTIMIZATION_FREQUENCY, API_UNIFIED_END_POINT) {

        $scope.platformIntegrations = angular.copy(PLATFORM_INTEGRATION);
        $scope.optimizationFrequencies = angular.copy(OPTIMIZATION_FREQUENCY);

        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.formProcessing = false;

        $scope.optimizationRule = optimizationRule;

        $scope.isNew = autoOptimizeIntegration === null;

        $scope.isFixSelectedSite = angular.isArray(selectedSites);
        $scope.isFixSelectedAdSlot = angular.isArray(selectedAdSlots);
        $scope.autoOptimizeIntegration = autoOptimizeIntegration || {
                publisher: optimizationRule.publisher,
                optimizationRule: optimizationRule,
                name: null,
                identifierMapping: '',
                identifierField: '',
                segments: [],
                active: 1,
                supplies: [], // old key is "sites"
                adSlots: [],
                videoPublishers: [],
                waterfallTags: [],
                optimizationAlerts: '',
                platformIntegration: null,
                optimizationFrequency: null
            };

        if ($scope.isNew && $scope.isFixSelectedSite) {
            _initSelectedSites();
        }

        if ($scope.isNew && $scope.isFixSelectedAdSlot) {
            _initSelectedAdSlots();
        }

        // temporarily add sites to model (because old term is "sites"), need remove before submitting
        $scope.autoOptimizeIntegration.sites = $scope.autoOptimizeIntegration.supplies;
        $scope.autoOptimizeIntegration.videoPublishers = refactorListByIds($scope.autoOptimizeIntegration.videoPublishers || []) ;
        $scope.autoOptimizeIntegration.waterfallTags = refactorListByIds($scope.autoOptimizeIntegration.waterfallTags || []);
        var tempWaterFall = angular.copy($scope.autoOptimizeIntegration.waterfallTags);

        $scope.FROM_IDENTIFIERS = [
            {key: 'adTagId', label: 'Ad Tag ID'},
            {key: 'adTagName', label: 'Ad Tag Name'}
        ];

        $scope.FROM_IDENTIFIERS_VIDEO = [
            {key: 'demandAdTagId', label: 'Demand Ad Tag ID'},
            {key: 'demandAdTagName', label: 'Demand Ad Tag Name'}
        ];

        $scope.OPTIMIZATION_ALERTS = [
            {key: 'autoOptimization', label: 'Auto Optimization'},
            {key: 'autoOptimizeAndNotifyMe', label: 'Auto optimize and Notify me'},
            {key: 'notifyMeBeforeMakingChange', label: 'Notify me before making change'}
        ];

        $scope.supportedSegments = [
            {key: 'country', label: 'Country'},
            {key: 'domain', label: 'Domain'}
        ];

        $scope.columnName = {};

        $scope.siteList = $scope.isFixSelectedSite ? selectedSites : _getSitesForPublisher($scope.autoOptimizeIntegration.optimizationRule.publisher);

        $scope.countries = COUNTRY_LIST;

        $scope.videoPublishersList = videoPublishers || [];
        $scope.waterfallTagsList = [];

        var mostCommonlyCountry = [
            {name: 'Australia', code: 'AU', line: true},
            {name: 'Canada', code: 'CA', line: true},
            {name: 'United Kingdom', code: 'GB', line: true},
            {name: 'United States', code: 'US', line: true}
        ];

        angular.forEach($scope.countries, function (country, index) {
            angular.forEach(mostCommonlyCountry, function (mostCommonly) {
                if (mostCommonly.code == country.code) {
                    delete $scope.countries[index];
                    $scope.countries.unshift(mostCommonly);
                }
            })
        });

        /* init form */
        _initForm();

        // all scope functions here
        $scope.groupEntities = groupEntities;
        $scope.backToListAuto = backToListAuto;
        $scope.isPubvantageAdServer = isPubvantageAdServer;
        $scope.onChangePlatformIntergrationType = onChangePlatformIntergrationType;
        $scope.onVideoPublishersClick = onVideoPublishersClick;

        $scope.filterText = filterText;
        $scope.isFormValid = isFormValid;
        $scope.isAdmin = isAdmin;
        $scope.submit = submit;

        /* ==========LOCAL FUNCTIONS FOR SCOPE============ */
        function isPubvantageAdServer() {
            return !!($scope.autoOptimizeIntegration.platformIntegration.type == 'PUBVANTAGE_ADS_SERVER');
        }

        function onChangePlatformIntergrationType(item) {
            if(item && item.type == 'PUBVANTAGE_ADS_SERVER') {
                $scope.autoOptimizeIntegration.videoPublishers = [];
                refreshIstEvenSelected($scope.videoPublishersList);
            } else {
                $scope.autoOptimizeIntegration.sites = [];
                refreshIstEvenSelected($scope.siteList);
            }
        }

        function refreshIstEvenSelected($selected) {
            _.each($selected, function(item){
                if(item && item.ticked) 
                    item.ticked = !item.ticked;
            })  
        }

        function fillTicked(items, source) {
            _.each(source, function(s){
                if(!_.isEmpty(items))
                    for (var i = items.length - 1; i >= 0; i--) {
                        if((s.id || s) == items[i]) {
                            s.ticked = true;
                            break;
                        }
                    }
                else
                    s.ticked = true;
            })
        }

        function refactorListByIds(items) {
            return _.map(angular.copy(items), function(val, key){
                    return _.isObject(val) && _.has(val, 'id') ? val.id : val;
                }) || [];
        }

        function onVideoPublishersClick(data) {
            return getWaterfallTagsListByVideoPublishers(data);
        }

        function groupEntities(item) {
            if (item.line) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function backToListAuto() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.autoOptimizeIntegration, '^.^.autoOptimizeIntegration.list', {optimizationRuleId: $scope.optimizationRule.id});
        }

        function filterText(factor) {
            if (!$scope.optimizationRule) {
                return false
            }

            var factorFieldType = $scope.optimizationRule.reportView.fieldTypes[factor];

            return factorFieldType == 'text' || factorFieldType == 'largeText'
        }

        function isFormValid() {
            return $scope.autoOptimizeIntegrationForm.$valid
                && (($scope.autoOptimizeIntegration.sites != null
                && $scope.autoOptimizeIntegration.sites.length > 0) || !_.isEmpty($scope.autoOptimizeIntegration.videoPublishers));
        }

        function isAdmin() {
            return Auth.isAdmin();
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            /* refactor submit data */
            var autoOptimizeIntegration = _refactorSubmitData(angular.copy($scope.autoOptimizeIntegration));

            var saveOptimizationIntegrationResource = $scope.isNew ? AutoOptimizeIntegrationManager.post(autoOptimizeIntegration) : AutoOptimizeIntegrationManager.one(autoOptimizeIntegration.id).patch(autoOptimizeIntegration);

            saveOptimizationIntegrationResource
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.UPDATE_SUCCESS')
                        });

                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.autoOptimizeIntegration, '^.^.autoOptimizeIntegration.list', {optimizationRuleId: autoOptimizeIntegration.optimizationRule || $scope.optimizationRule.id});
                    })
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.autoOptimizeIntegrationForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    })
                ;
        }

        /* ==========LOCAL FUNCTIONS============ */
        function _initSelectedSites() {
            var siteIds = [];
            angular.forEach(selectedSites, function (selectedSite) {
                if (selectedSite.id) {
                    siteIds.push(selectedSite.id);
                }
            });

            $scope.autoOptimizeIntegration.supplies = siteIds;
        }

        function _initSelectedAdSlots() {
            var adSlotIds = [];
            angular.forEach(selectedAdSlots, function (selectedAdSlot) {
                if (selectedAdSlot.id) {
                    adSlotIds.push(selectedAdSlot.id);
                }
            });

            $scope.autoOptimizeIntegration.adSlots = adSlotIds;
        }

        function _filterAdSlotList(adSlotList, adSlotIdNeedSkip) {
            var filteredAdSlots = [];

            angular.forEach(adSlotList, function (adSlot) {
                var rightAdSlotId = adSlot.id in adSlotIdNeedSkip;
                if (!!adSlot.autoOptimize && rightAdSlotId == false) {
                    filteredAdSlots.push(adSlot);
                }
            });

            return filteredAdSlots;
        }

        function _updatePlatformIntegration() {
            if ($scope.isNew) {
                $scope.autoOptimizeIntegration.platformIntegration = $scope.platformIntegrations[0]; // Pubvantage ads server
            } else {
                var apiPlatform = $scope.autoOptimizeIntegration.platformIntegration;
                $scope.autoOptimizeIntegration.platformIntegration = $scope.platformIntegrations.find(function (platform) {
                    return platform.value == apiPlatform
                });
            }
        }

        function _updateOptimizationFrequency() {
            if (!$scope.isNew) {
                var apiFrequency = angular.copy($scope.autoOptimizeIntegration.optimizationFrequency);
                $scope.autoOptimizeIntegration.optimizationFrequency = $scope.optimizationFrequencies.find(function (frequency) {
                    return frequency.value == apiFrequency
                });
            }
        }

        function _initForm() {
            _updatePlatformIntegration();
            _updateOptimizationFrequency();

            /* update identifierMapping */
            if (!$scope.isNew) {
                $scope.autoOptimizeIntegration.identifierMapping = {
                    key: $scope.autoOptimizeIntegration.identifierMapping,
                    label: _getIdentifierObjectFromValue($scope.autoOptimizeIntegration.identifierMapping)
                };
                $scope.autoOptimizeIntegration.optimizationAlerts = {
                    key: $scope.autoOptimizeIntegration.optimizationAlerts,
                    label: _getOptimizationAlertsLabelFromObject($scope.autoOptimizeIntegration.optimizationAlerts)
                };

            }

            /* update column name mapping for all dimensions from optimization rule's report view */
            _setColumnName();

            /* update all assets of form*/
            updateAllAssets();

        }

        function _getSitesForPublisher(publisher) {
            if (sites.length > 0) {
                return $filter('selectedPublisher')(angular.copy(sites), publisher);
            }

            return [];
        }

        function _getAdSlotsForSites(siteIds) {
            return AdSlotManager.getList({siteIds: siteIds.join(',')})
                .then(function (adSlots) {
                    angular.forEach(adSlots, function (adSlot) {
                        adSlot.name = adSlot.libraryAdSlot.name;
                        adSlot.publisher = adSlot.libraryAdSlot.publisher
                    });

                    return adSlots.plain();
                })
        }
       

        function getWaterfallTagsListByVideoPublishers(data, isOneLoadOnly) {
            if(data == 'reset')
                $scope.autoOptimizeIntegration.videoPublishers = [];
            else if (data == 'all')
                $scope.autoOptimizeIntegration.videoPublishers = _.pluck($scope.videoPublishersList, 'id');

            return VideoWaterfallManager.getList({
                videoPublishersIds: (_.map($scope.autoOptimizeIntegration.videoPublishers, function(val, key){
                    return _.isObject(val) && _.has(val, 'id') ? val.id : val;
                }) || []).join(',')
            })
            .then(function (videosWaterfall) {
                var videosWaterfall = videosWaterfall ? videosWaterfall.plain() : [];
                dataService.makeHttpGetRequest('/v1/optimizationintegrations/waterfalltags/ids', null, API_UNIFIED_END_POINT)
                .then(function (waterfalls) {
                    $scope.waterfallTagsList = _.filter(videosWaterfall, function(wt){
                        return wt ? wt.id !== _.first(_.values(waterfalls)) : true;
                    })
                    if(!$scope.isNew && isOneLoadOnly)
                        fillTicked(tempWaterFall, $scope.waterfallTagsList);

                });
            });
        }

        function _getIdentifierObjectFromValue(key) {
            var label = '';
            angular.forEach(isPubvantageAdServer() ? $scope.FROM_IDENTIFIERS : $scope.FROM_IDENTIFIERS_VIDEO, function (item) {
                if (item.key == key) {
                    label = item.label;
                }
            });

            return label;
        }

        function _setColumnName() {
            var reportViewDataSets = $scope.optimizationRule.reportView.reportViewDataSets;
            if (!reportViewDataSets) {
                return;
            }

            angular.forEach(reportViewDataSets, function (reportViewDataSet) {
                var dataSet = reportViewDataSet.dataSet;
                var dimensions = Object.keys(dataSet.dimensions);
                var metrics = Object.keys(dataSet.metrics);

                angular.forEach(dimensions.concat(metrics), function (dimension) {
                    $scope.columnName[dimension + '_' + dataSet.id] = dimension + ' (' + dataSet.name + ')';
                });
            });
        }

        function updateAllAssets() {
            _updateSelectedSitesAndAdSlots();
            updateVideoPublishersAndWaterFalls();
        }

        function updateVideoPublishersAndWaterFalls() {
            fillTicked($scope.autoOptimizeIntegration.videoPublishers, $scope.videoPublishersList);
            
            getWaterfallTagsListByVideoPublishers(null, true);
        }

        function _updateSelectedSitesAndAdSlots() {
            _fillStickForSupply();
            // update adSlotList and also fillStickForAdSlot
            _updateAdSlotListWhenSelectedSitesChange();
        }

        function _fillStickForSupply() {
            // angular.forEach($scope.siteList, function (site) {
            //     site['ticked'] = $scope.autoOptimizeIntegration.sites.indexOf(site.id) > -1
            // });

            var selectedSites = $scope.autoOptimizeIntegration.sites;

            angular.forEach($scope.siteList, function (site) {
                for (var index in selectedSites) {
                    if (!selectedSites.hasOwnProperty(index)) {
                        continue;
                    }

                    var selectedId = selectedSites[index];
                    if (selectedSites[index].id) {
                        selectedId = selectedSites[index].id;
                    }

                    if (site.id == selectedId) {
                        site['ticked'] = true;
                    }
                }
            });
        }

        function _fillStickForAdSlot() {
            // angular.forEach($scope.adSlotList, function (adSlot) {
            //     adSlot['ticked'] = $scope.autoOptimizeIntegration.adSlots.indexOf(adSlot.id) > -1
            // });

            var selectedAdSlots = $scope.autoOptimizeIntegration.adSlots;

            angular.forEach($scope.adSlotList, function (adSlot) {
                for (var index in selectedAdSlots) {
                    if (!selectedAdSlots.hasOwnProperty(index)) {
                        continue;
                    }

                    var selectedId = selectedAdSlots[index];
                    if (selectedAdSlots[index].id) {
                        selectedId = selectedAdSlots[index].id;
                    }

                    if (adSlot.id == selectedId) {
                        adSlot['ticked'] = true;
                    }
                }
            });
        }

        $scope.$watch(function () {
            return $scope.autoOptimizeIntegration.sites;
        }, function (oldSelectedSites, newSelectedSites) {
            var changed = (oldSelectedSites.length != newSelectedSites.length);

            if (changed) {
                return _updateAdSlotListWhenSelectedSitesChange()
            }
        }, true);

        function _updateAdSlotListWhenSelectedSitesChange() {
            if ($scope.isFixSelectedAdSlot) {
                angular.forEach(selectedAdSlots, function (adSlot) {
                    adSlot.name = adSlot.libraryAdSlot.name;
                    adSlot.publisher = adSlot.libraryAdSlot.publisher
                });

                $scope.adSlotList = selectedAdSlots;
                AutoOptimizeIntegrationManager.one('adslot').one('ids').get({id: $scope.autoOptimizeIntegration.id})
                    .then(function (adSlotIds) {
                        $scope.adSlotIds = adSlotIds.plain();
                        $scope.adSlotList = adSlots.plain();
                        $scope.adSlotList = _filterAdSlotList($scope.adSlotList, $scope.adSlotIds);
                        _fillStickForAdSlot();
                    });

                return;
            }

            // build adSlotList due to selected sites
            var siteIds = [];
            angular.forEach(angular.copy($scope.autoOptimizeIntegration.sites), function (site) {
                if (site.id) {
                    siteIds.push(site.id);
                } else {
                    siteIds.push(site);
                }
            });

            if (siteIds.length < 1) {
                $scope.adSlotList = [];
                return;
            }
            $scope.adSlotIds = [];

            AdSlotManager.getList({siteIds: siteIds.join(',')})
                .then(function (adSlots) {
                    angular.forEach(adSlots, function (adSlot) {
                        adSlot.name = adSlot.libraryAdSlot.name;
                        adSlot.publisher = adSlot.libraryAdSlot.publisher
                    });
                    AutoOptimizeIntegrationManager.one('adslot').one('ids').get({id: $scope.autoOptimizeIntegration.id})
                        .then(function (adSlotIds) {
                            $scope.adSlotIds = adSlotIds.plain();
                            $scope.adSlotList = adSlots.plain();
                            $scope.adSlotList = _filterAdSlotList($scope.adSlotList, $scope.adSlotIds);
                            _fillStickForAdSlot();
                        });


                });
        }

        function _refactorSubmitData(autoOptimizeIntegration) {
            /* remove publisher */
            delete autoOptimizeIntegration.publisher;

            /* autoOptimizationRule */
            autoOptimizeIntegration.optimizationRule = autoOptimizeIntegration.optimizationRule.id;

            /* identifierMapping */
            autoOptimizeIntegration.identifierMapping = _getIdentifierValueFromObject(autoOptimizeIntegration.identifierMapping);
            autoOptimizeIntegration.optimizationAlerts = _getOptimizationAlertsValueFromObject(autoOptimizeIntegration.optimizationAlerts);

            /* refactor segments */
            angular.forEach(autoOptimizeIntegration.segments, function (segment) {
                angular.forEach(angular.copy(segment.neededValue), function (item) {
                    if (item == '' && !item) {
                        var index = segment.neededValue.indexOf(item);

                        if (index > -1) {
                            segment.neededValue.splice(index, 1)
                        }
                    }
                });
            });

            /* refactor selected sites, adSlot */
            var adSlotIds = [];
            var siteIds = [];

            angular.forEach(autoOptimizeIntegration.sites, function (site) {
                siteIds.push(site.id)
            });

            angular.forEach(autoOptimizeIntegration.adSlots, function (adSlot) {
                adSlotIds.push(adSlot.id)
            });

            autoOptimizeIntegration.videoPublishers = refactorListByIds($scope.autoOptimizeIntegration.videoPublishers || []);
            autoOptimizeIntegration.waterfallTags = refactorListByIds($scope.autoOptimizeIntegration.waterfallTags || []);


            autoOptimizeIntegration.adSlots = adSlotIds;
            // use supplies instead of sites for submitting
            autoOptimizeIntegration.supplies = siteIds;
            delete autoOptimizeIntegration.sites;

            // platform integration
            autoOptimizeIntegration.platformIntegration = autoOptimizeIntegration.platformIntegration.value;
            // optimization frequency
            autoOptimizeIntegration.optimizationFrequency = autoOptimizeIntegration.optimizationFrequency.value;
            delete autoOptimizeIntegration.startRescoreAt;
            delete autoOptimizeIntegration.endRescoreAt;
            //If change optimization alert type => active status is 0
            if(autoOptimizeIntegration.optimizationAlerts === 'notifyMeBeforeMakingChange'){
                autoOptimizeIntegration.active = 0;
            } else {
                autoOptimizeIntegration.active = 1;
            }
            /* return */
            return autoOptimizeIntegration;
        }

        function _getIdentifierValueFromObject(obj) {
            return !!obj.key ? obj.key : undefined;
        }


        function _getOptimizationAlertsValueFromObject(obj) {
            return !!obj.key ? obj.key : undefined;
        }

        function _getOptimizationAlertsLabelFromObject(key) {
            var label = '';
            angular.forEach($scope.OPTIMIZATION_ALERTS, function (item) {
                if (item.key == key) {
                    label = item.label;
                }
            });

            return label;
        }

        
    }
})();