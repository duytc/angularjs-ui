(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('PerformanceReportSelector', PerformanceReportSelector)
    ;

    function PerformanceReportSelector($scope, $translate, $q, $state, _, PERFORMANCE_REPORT_TYPES, Auth, UserStateHelper, AlertService, performanceReport, AdNetworkManager, adminUserManager, reportSelectorForm, ReportParams) {
        // important init code at the bottom

        var toState = null;

        var isAdmin = Auth.isAdmin();
        var isSubPublisher = Auth.isSubPublisher();
        $scope.isAdmin = isAdmin;
        $scope.isSubPublisher = isSubPublisher;
        var demandSourceTransparency = $scope.demandSourceTransparency = Auth.getSession().demandSourceTransparency;

        var selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            breakDowns: null,
            publisherId: null,
            reportType: null,
            adNetworkId: null,
            siteId: null,
            adSlotId: null,
            ronAdSlotId: null
        };

        $scope.selectedData = selectedData;

        var formDefaults = {
            selectedData: _.omit(selectedData, ['date', 'publisherId', 'reportType'])
        };

        function resetForm() {
            angular.extend($scope.selectedData, formDefaults.selectedData);
        }

        $scope.optionData = {
            adNetworks: [],
            sites: [],
            adSlots: [],
            adNetworkSites: [],
            ronAdSlots: []
        };

        var totalRecord = 0;
        var paramsForPager = {
            page: 1
        };

        $scope.isFormValid = isFormValid;
        $scope.showPublisherSelect = showPublisherSelect;
        $scope.showReportTypeSelect = showReportTypeSelect;
        $scope.fieldShouldBeVisible = fieldShouldBeVisible;
        $scope.selectedReportTypeis = selectedReportTypeis;
        $scope.groupEntities = groupEntities;
        $scope.filterNonEntityValues = filterNonEntityValues;
        $scope.selectPublisher = selectPublisher;
        $scope.selectReportType = selectReportType;
        $scope.selectEntity = selectEntity;
        $scope.selectAdNetwork = selectAdNetwork;
        $scope.selectSiteForAdNetwork = selectSiteForAdNetwork;
        $scope.selectBreakdownOption = selectBreakdownOption;
        $scope.getReports = getReports;
        $scope.selectSite = selectSite;
        $scope.getAdSlot = getAdSlot;
        $scope.getRonAdSlot = getRonAdSlot;
        $scope.selectedPublisherRonAdSlot = selectedPublisherRonAdSlot;
        $scope.filterForDemandSourceReport = filterForDemandSourceReport;
        $scope.clickBreakdown = clickBreakdown;
        $scope.disabledOption = disabledOption;
        $scope.addMoreItems = addMoreItems;

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.reportTypes = PERFORMANCE_REPORT_TYPES;

        var reportFields = {
            publisher: 'publisher',
            adNetwork: 'adnetwork',
            site: 'site',
            adSlot: 'adSlot',
            ronAdSlot: 'ronAdSlot'
        };

        $scope.reportFields = reportFields;

        var reportTypeSite = {
                key: PERFORMANCE_REPORT_TYPES.site,
                breakdownKey: 'breakDown',
                label: 'Site',
                toState: 'reports.performance.sites',
                visibleFields: [reportFields.site],
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.site'
                    },
                    {
                        key: 'adslot',
                        label: 'By Ad Slot',
                        toState: 'reports.performance.siteAdSlots'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performance.siteAdTags'
                    }
                ]
            };

        if(!isSubPublisher) {
            reportTypeSite.breakdownOptions.push({
                key: 'adnetwork',
                label: 'By Demand Partner',
                toState: 'reports.performance.siteAdNetworks'
            })
        }

        var reportTypeOptions = [
            reportTypeSite,
            {
                key: PERFORMANCE_REPORT_TYPES.adSlot,
                breakdownKey: 'breakDown',
                label: 'Ad Slot',
                toState: 'reports.performance.adSlots',
                visibleFields: [reportFields.site, reportFields.adslot],
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.adSlot'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performance.adSlotAdTags'
                    }
                ]
            }
        ];

        if(!isSubPublisher) {
            reportTypeOptions.unshift({
                key: PERFORMANCE_REPORT_TYPES.adNetwork,
                breakdownKey: 'breakDown',
                label: 'Demand Partner',
                toState: 'reports.performance.adNetworks',
                visibleFields: [reportFields.adNetwork],
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.adNetwork'
                    },
                    {
                        key: 'site',
                        label: 'By Site',
                        toState: 'reports.performance.adNetworkSites'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performance.adNetworkAdTags'
                    }
                ]
            });

            reportTypeOptions.unshift({
                key: PERFORMANCE_REPORT_TYPES.account,
                breakdownKey: 'breakDown',
                label: 'Account',
                toState: 'reports.performance.account'
            });

            reportTypeOptions.push( {
                key: PERFORMANCE_REPORT_TYPES.ronAdSlot,
                breakdownKey: 'breakDown',
                label: 'RON Ad Slot',
                toState: 'reports.performance.ronAdSlots',
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.ronAdSlot'
                    },
                    {
                        key: 'segment',
                        label: 'By Segment',
                        toState: 'reports.performance.ronAdSlotSegments'
                    },
                    {
                        key: 'site',
                        label: 'By Site',
                        toState: 'reports.performance.ronAdSlotSites'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performance.ronAdSlotAdTags'
                    }
                ]
            });
        }

        if (isAdmin) {
            reportTypeOptions.unshift({
                key: PERFORMANCE_REPORT_TYPES.platform,
                breakdownKey: 'breakDown',
                label: 'Platform',
                toState: 'reports.performance.platform',
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.platform'
                    },
                    {
                        key: 'account',
                        label: 'By Account',
                        toState: 'reports.performance.platformAccounts'
                    },
                    {
                        key: 'site',
                        label: 'By Site',
                        toState: 'reports.performance.platformSites'
                    }
                ]
            });
        }

        $scope.reportTypeOptions = reportTypeOptions;

        var hasGetAdSlot = false;
        var hasGetRonAdSlot = false;

        function clickBreakdown(option) {
            var breakdowns = _addToArrayBreakdownSupport(option);

            if(($scope.selectedData.reportType.key == 'adNetwork' && !$scope.selectedData.adNetworkId) || ($scope.selectedData.reportType.key == 'site' && !$scope.selectedData.siteId)) {
                if(breakdowns.length == 1 && breakdowns.indexOf('day') > -1 && option != 'day' && option != null) {
                    $scope.selectedData.breakDowns['day'] = false;
                    $scope.selectedData.labelBreakdown = null;
                    $scope.selectedData.breakdown = null;
                    $scope.selectedData.subBreakdown = null;
                    _setVarBreakdown([]);
                    return
                }
            }

            _setVarBreakdown(breakdowns);
        }

        function _setVarBreakdown(breakdowns) {
            if(breakdowns.length == 2) {
                var indexOfDay = breakdowns.indexOf('day');
                $scope.selectedData.breakDown = breakdowns[indexOfDay == 0 ? 1 : 0];
                $scope.selectedData.subBreakDown = breakdowns[indexOfDay];
            } else {
                $scope.selectedData.breakDown = breakdowns[0];
                $scope.selectedData.subBreakDown = null;
            }

            var breakdownOption = _.find($scope.selectedData.reportType.breakdownOptions, function(breakdownOption) {
                return breakdownOption.key == $scope.selectedData.breakDown;
            });

            $scope.selectedData.labelBreakdown = _getLabelBreakdown([$scope.selectedData.breakDown, $scope.selectedData.subBreakDown]);

            if(!!breakdownOption && !!breakdownOption.toState) {
                toState = breakdownOption.toState;
            }
        }

        function _getLabelBreakdown(breakdowns) {
            var labels = '';

            angular.forEach(breakdowns, function(breakdown, index) {
                var breakdownOption = _.find($scope.selectedData.reportType.breakdownOptions, function(breakdownOption) {
                    return breakdownOption.key == breakdown;
                });

                if(!!breakdownOption) {
                    labels = labels + (index != 0 ? ', ' : '') + breakdownOption.label;
                }
            });

            return labels;
        }

        function _addToArrayBreakdownSupport(option) {
            var breakdowns = [];

            for(var index in $scope.selectedData.breakDowns) {
                if(option != 'day' && $scope.selectedData.breakDowns[index] && index != 'day' && index != option) {
                    $scope.selectedData.breakDowns[index] = false;
                }

                if($scope.selectedData.breakDowns[index]) {
                    breakdowns.push(index)
                }
            }

            return breakdowns;
        }

        function disabledOption(option) {
            if(option != 'day') {
                return false
            }

            var breakdowns = _addToArrayBreakdownSupport(option);

            if($scope.selectedData.reportType.key == 'adNetwork' && !$scope.selectedData.adNetworkId && breakdowns.length == 0) {
                return true;
            } else if($scope.selectedData.reportType.key == 'site' && !$scope.selectedData.siteId && breakdowns.length == 0) {
                return true;
            }

            return false;
        }

        function isFormValid() {
            return $scope.reportSelectorForm.$valid;
        }

        function showReportTypeSelect() {
            return true;
        }

        function showPublisherSelect() {
            return isAdmin && $scope.reportSelectorForm.reportType.$valid;
        }

        /**
         *
         * @param {String} reportTypeKey
         * @return {Object|Boolean}
         */
        function findReportType(reportTypeKey) {
            return _.findWhere(reportTypeOptions, { key: reportTypeKey });
        }

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function addAllOption(data, label)
        {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                name: label || 'All'
            });

            return data;
        }

        function selectedReportTypeis(reportTypeKey) {
            var reportType = $scope.selectedData.reportType;

            if (!angular.isObject(reportType)) {
                return false;
            }

            return reportType.key == reportTypeKey;
        }

        function fieldShouldBeVisible(field) {
            var selectedReportType = $scope.selectedData.reportType;

            if (!angular.isObject(selectedReportType) || !angular.isArray(selectedReportType.visibleFields)) {
                return false;
            }

            return selectedReportType.visibleFields.indexOf(field) !== -1;
        }

        function resetToStateForCurrentReportType() {
            var selectedReportType = $scope.selectedData.reportType;

            if (angular.isObject(selectedReportType)) {
                toState = selectedReportType.toState;
            }
        }

        function groupEntities(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        /**
         * When searching for values in ui-select, we may have values that represent collections instead of single values
         * i.e "All Demand Partners" option. We filter out these values if the user is searching specifically for a value
         *
         * @param {String} searchText
         * @returns {Function}
         */
        function filterNonEntityValues(searchText) {
            return function(item) {
                if (!searchText) {
                    return true;
                }

                return item.id !== null;
            };
        }

        function selectPublisher(publisher) {
            resetForm();
            getData(publisher.id, $scope.selectedData.reportType);
        }

        /**
         *
         * @param {Object} reportType
         */
        function selectReportType(reportType) {
            $scope.selectedData.siteId = null;
            $scope.selectedData.labelBreakdown = null;
            $scope.selectedData.breakDown = null;
            $scope.selectedData.breakDowns = [];

            if (!angular.isObject(reportType) || !reportType.toState) {
                throw new Error('report type is missing a target state');
            }

            if(reportType.key == $scope.reportTypes.ronAdSlot) {
                getRonAdSlot()
            }

            getData($scope.selectedData.publisherId, reportType);

            _setBreakdownOptionsDefaultForReportType(reportType, $scope.selectedData);

            $scope.selectedData.reportType = reportType;
            _setDefaultBreakDown(reportType, $scope.selectedData);

            toState = reportType.toState;

        }

        function _setDefaultBreakDown(reportType, selectedData) {
            if(reportType.key == 'adNetwork' && !selectedData.adNetworkId) {
                $scope.selectedData.breakDowns['partner'] = true;
                clickBreakdown('partner');
            } else if(reportType.key == 'site' && reportType.toState == 'reports.performance.sites' && !selectedData.siteId) {
                $scope.selectedData.breakDowns['site'] = true;
                clickBreakdown('site');
            } else {
                clickBreakdown(null);
            }
        }

        function selectEntity(entityId) {
            $scope.selectedData.labelBreakdown = null;
            $scope.selectedData.breakDown = null;
            $scope.selectedData.breakDowns = [];

            clickBreakdown(null);
            resetToStateForCurrentReportType();
        }

        function selectAdNetwork(adNetworkId) {
            $scope.selectedData.labelBreakdown = null;
            $scope.selectedData.breakDown = null;
            $scope.selectedData.breakDowns = [];
            $scope.selectedData.siteId = null;

            paramsForPager.page = 1;

            if(adNetworkId){
                AdNetworkManager.one(adNetworkId).one('sites').get(paramsForPager)
                .then(function(datas) {
                    var sites = [];
                    totalRecord = datas.totalRecord;
                    angular.forEach(datas.records, function(data) {
                        sites.push(data.site);
                    });

                    addAllOption(sites, 'All Sites');
                    $scope.optionData.adNetworkSites = sites;
                });

                _setBreakdownOptionsForAllSiteByDemandPartner();

                clickBreakdown(null);
            } else {
                _setBreakdownOptionsForAllDemandPartner();

                $scope.selectedData.adNetworkId = adNetworkId;
                _setDefaultBreakDown($scope.selectedData.reportType, $scope.selectedData);
            }

            resetToStateForCurrentReportType();
        }

        // reset toState of Demand Partner
        function selectSiteForAdNetwork(siteId) {
            $scope.selectedData.labelBreakdown = null;
            $scope.selectedData.breakDown = null;
            $scope.selectedData.breakDowns = [];

            clickBreakdown(null);

            if(!siteId) {
                return $scope.selectedData.reportType.breakdownOptions = [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.adNetwork'
                    },
                    {
                        key: 'subpublisher',
                        label: 'By Sub Publisher',
                        toState: 'reports.performance.adNetworkSiteSubPublishers'
                    },
                    {
                        key: 'site',
                        label: 'By Site',
                        toState: 'reports.performance.adNetworkSites'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performance.adNetworkAdTags'
                    }
                ]
            }

            return $scope.selectedData.reportType.breakdownOptions = [
                {
                    key: 'day',
                    label: 'By Day',
                    toState: 'reports.performance.adNetworkSite'
                },
                {
                    key: 'adtag',
                    label: 'By Ad Tag',
                    toState: 'reports.performance.adNetworkSiteAdTags'
                }
            ]
        }

        function selectSite(siteId) {
            $scope.selectedData.labelBreakdown = null;
            $scope.selectedData.breakDown = null;
            $scope.selectedData.breakDowns = [];
            $scope.selectedData.adSlotId = null;
            $scope.selectedData.siteId = siteId;

            clickBreakdown(null);
            resetToStateForCurrentReportType();

            hasGetAdSlot = false;
            getAdSlot(siteId);

            if($scope.selectedData.reportType.toState != 'reports.performance.adSlots') {
                if(!siteId) {
                    _setBreakdownOptionsDefaultForReportType($scope.selectedData.reportType, $scope.selectedData);
                    _setDefaultBreakDown($scope.selectedData.reportType, $scope.selectedData);
                } else {
                    _setBreakdownOptionsForSite();
                }
            }
        }

        function getAdSlot(siteId) {
            if(hasGetAdSlot || toState != 'reports.performance.adSlots' || !siteId) {
                return
            }

            hasGetAdSlot = true;
            reportSelectorForm.getAdSlotsForSite(siteId)
                .then(function(adSlots) {
//                        addAllOption(adSlots, 'All AdSlots');
                    $scope.optionData.adSlots = adSlots;
                }
            );
        }

        function getRonAdSlot() {
            if(hasGetRonAdSlot) {
                return
            }

            hasGetRonAdSlot = true;
            reportSelectorForm.getRonAdSlot()
                .then(function(ronAdSlots) {

                    $scope.optionData.ronAdSlots = ronAdSlots;
                })
                .catch(function() {
                    hasGetRonAdSlot = false;
                });
        }

        function selectedPublisherRonAdSlot(ronAdSlot) {
            if(ronAdSlot.libraryAdSlot.libType == 'dynamic') {
                return false;
            }

            if(!isAdmin) {
                return true;
            }

            else if(ronAdSlot.libraryAdSlot.publisher.id == $scope.selectedData.publisherId) {
                return true
            }

            return false
        }

        function filterForDemandSourceReport(option) {
            if(!demandSourceTransparency && option.key == 'adtag') {
                return false;
            }

            return true;
        }

        function selectBreakdownOption(breakdownOption) {
            if (!angular.isObject(breakdownOption) || !breakdownOption.toState) {
                throw new Error('breakdown option is missing a target state');
            }

            toState = breakdownOption.toState;
        }

        function getReports() {
            var transition;
            var params = ReportParams.getStateParams($scope.selectedData);

            var reportType = params.reportType;
            var breakdownValue = params[params.breakdownKey];

            if (breakdownValue != undefined && breakdownValue != null) {
                var breakdownOption = _.findWhere(reportType.breakdownOptions, { key: breakdownValue });
                if(!!breakdownOption) {
                    selectBreakdownOption(breakdownOption);
                }
            }

            if (toState == null) {
                transition = $state.transitionTo(
                    $state.$current,
                    params
                );
            } else {
                transition = UserStateHelper.transitionRelativeToBaseState(
                    toState,
                    params
                );
            }

            $q.when(transition)
                .catch(function(error) {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message:  $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        function getData(publisher, reportType) {
            var publisherId = isAdmin ? publisher : Auth.getSession().id;

            if(!publisherId || !reportType) {
                return;
            }

            if(reportType.key == $scope.reportTypes.adNetwork) {
                if(!isAdmin) {
                    reportSelectorForm.getAdNetworks()
                        .then(function (data) {
                            addAllOption(data, 'All Demand Partners');

                            $scope.optionData.adNetworks = data;
                        })
                    ;
                } else {
                    adminUserManager.one(publisherId).one('adnetworks').getList()
                        .then(function (data) {
                            addAllOption(data, 'All Demand Partners');

                            $scope.optionData.adNetworks = data;
                        })
                }
            }

            if(reportType.key == $scope.reportTypes.site || reportType.key == $scope.reportTypes.adSlot) {
                if(!isAdmin) {
                    reportSelectorForm.getSites()
                        .then(function (data) {

                            addAllOption(data, 'All Sites');
                            $scope.optionData.sites = data;
                        })
                    ;
                } else {
                    adminUserManager.one(publisherId).one('sites').getList()
                        .then(function (data) {

                            addAllOption(data, 'All Sites');
                            $scope.optionData.sites = data;
                        })
                }
            }
        }

        function addMoreItems() {
            var page = Math.ceil((($scope.optionData.adNetworkSites.length -1)/10) + 1);

            if(paramsForPager.page === page || (page > Math.ceil(totalRecord/10) && page != 1)) {
                return
            }

            paramsForPager.page = page;

            return AdNetworkManager.one($scope.selectedData.adNetworkId).one('sites').get(paramsForPager)
                .then(function(datas) {
                    totalRecord = datas.totalRecord;
                    angular.forEach(datas.records, function(data) {
                        $scope.optionData.adNetworkSites.push(data.site);
                    });
                })
        }

        /**
         * set breakdownOptions default when select a report type
         * @param reportType
         * @param selectedData
         * @private
         */
        function _setBreakdownOptionsDefaultForReportType(reportType, selectedData) {
            if(reportType.key == 'adNetwork' && !selectedData.adNetworkId) {
                reportType.breakdownOptions = [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.adNetworksDay'
                    },
                    {
                        key: 'subpublisher',
                        label: 'By Sub Publisher',
                        toState: 'reports.performance.adNetworksSubPublishers'
                    },
                    {
                        key: 'partner',
                        label: 'By Partner',
                        toState: 'reports.performance.adNetworks'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performance.adNetworksAdTags'
                    }
                ];
            }

            if(reportType.key == 'site' && reportType.toState == 'reports.performance.sites' && !selectedData.siteId) {
                reportType.breakdownOptions = [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performance.sitesDay'
                    },
                    {
                        key: 'site',
                        label: 'By Site',
                        toState: 'reports.performance.sites'
                    }
                ];
            }
        }

        /**
         * set breakdownOptions for all site and one demand partner
         * @private
         */
        function _setBreakdownOptionsForAllSiteByDemandPartner() {
            $scope.selectedData.reportType.breakdownOptions = [
                {
                    key: 'day',
                    label: 'By Day',
                    toState: 'reports.performance.adNetwork'
                },
                {
                    key: 'subpublisher',
                    label: 'By Sub Publisher',
                    toState: 'reports.performance.adNetworkSiteSubPublishers'
                },
                {
                    key: 'site',
                    label: 'By Site',
                    toState: 'reports.performance.adNetworkSites'
                },
                {
                    key: 'adtag',
                    label: 'By Ad Tag',
                    toState: 'reports.performance.adNetworkAdTags'
                }
            ];
        }

        /**
         * set breakdownOptions for all demand partner
         * @private
         */
        function _setBreakdownOptionsForAllDemandPartner() {
            $scope.selectedData.reportType.breakdownOptions = [
                {
                    key: 'day',
                    label: 'By Day',
                    toState: 'reports.performance.adNetworksDay'
                },
                {
                    key: 'subpublisher',
                    label: 'By Sub Publisher',
                    toState: 'reports.performance.adNetworksSubPublishers'
                },
                {
                    key: 'partner',
                    label: 'By Partner',
                    toState: 'reports.performance.adNetworks'
                },
                {
                    key: 'adtag',
                    label: 'By Ad Tag',
                    toState: 'reports.performance.adNetworksAdTags'
                }
            ];
        }

        /**
         * set breakdownOptions for a site
         * @private
         */
        function _setBreakdownOptionsForSite() {
            $scope.selectedData.reportType.breakdownOptions = [
                {
                    key: 'day',
                    label: 'By Day',
                    toState: 'reports.performance.site'
                },
                {
                    key: 'adslot',
                    label: 'By Ad Slot',
                    toState: 'reports.performance.siteAdSlots'
                },
                {
                    key: 'adtag',
                    label: 'By Ad Tag',
                    toState: 'reports.performance.siteAdTags'
                }
            ];

            if(!isSubPublisher) {
                $scope.selectedData.reportType.breakdownOptions.push({
                    key: 'adnetwork',
                    label: 'By Demand Partner',
                    toState: 'reports.performance.siteAdNetworks'
                })
            }
        }

        /////

        function init() {
            if (isAdmin) {
                reportSelectorForm.getPublishers()
                    .then(function (data) {
                        $scope.optionData.publishers = data;
                    })
                ;
            }

            update();

            if (!$scope.selectedData.date.startDate) {
                $scope.selectedData.date.startDate = moment().subtract(1, 'days').startOf('day');
            }

            if (!$scope.selectedData.date.endDate) {
                $scope.selectedData.date.endDate = $scope.selectedData.date.startDate
            }
        }

        function update() {
            var params = ReportParams.getFormParams(performanceReport.getInitialParams());

            params = params || {};

            if (!_.isObject(params)) {
                return;
            }

            reportSelectorForm.getCalculatedParams(params).then(
                function (calculatedParams) {
                    var reportType = findReportType(calculatedParams.reportType) || null;
                    _setBreakdownOptionsDefaultForReportType(reportType, calculatedParams);

                    $scope.selectedData.reportType = reportType;

                    var breakdownValue = calculatedParams[reportType.breakdownKey];
                    if (breakdownValue != undefined && breakdownValue != null) {
                        if (calculatedParams.adNetworkId != null) {
                            selectSiteForAdNetwork(calculatedParams.siteId);
                        }

                        var breakdownOption = _.findWhere(reportType.breakdownOptions, { key: breakdownValue });
                        selectBreakdownOption(breakdownOption);
                    }
                    else{
                        toState = reportType.toState;
                    }

                    resetForm();

                    if (calculatedParams.siteId != null) {
                        selectEntity(calculatedParams.siteId);
                    }

                    if (calculatedParams.adNetworkId != null) {
                        selectAdNetwork(calculatedParams.adNetworkId);
                        selectSiteForAdNetwork(calculatedParams.siteId);
                    }

                    if(($scope.optionData.adNetworks.length == 0 && calculatedParams.reportType == $scope.reportTypes.adNetwork) || ($scope.optionData.sites.length == 0 && (calculatedParams.reportType == $scope.reportTypes.site || calculatedParams.reportType == $scope.reportTypes.adSlot))) {
                        getData(calculatedParams.publisherId, {key: calculatedParams.reportType});
                    }

                    angular.extend($scope.selectedData, _.omit(calculatedParams, ['reportType']));

                    if (!$scope.selectedData.date.endDate) {
                        $scope.selectedData.date.endDate = $scope.selectedData.date.startDate
                    }

                    if($scope.selectedData.breakDown) {
                        $scope.selectedData.breakDowns = {};
                        $scope.selectedData.breakDowns[$scope.selectedData.breakDown] = true;

                        if($scope.selectedData.subBreakDown) {
                            $scope.selectedData.breakDowns[$scope.selectedData.subBreakDown] = true;
                        }

                        $scope.selectedData.labelBreakdown = _getLabelBreakdown([$scope.selectedData.breakDown, $scope.selectedData.subBreakDown]);
                    }
                }
            );
        }

        init();
        $scope.$on('$stateChangeSuccess', update);
    }
})();