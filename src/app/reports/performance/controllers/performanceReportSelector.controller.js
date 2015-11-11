(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('PerformanceReportSelector', PerformanceReportSelector)
    ;

    function PerformanceReportSelector($scope, $translate, $q, $state, _, PERFORMANCE_REPORT_TYPES, Auth, UserStateHelper, AlertService, performanceReport, reportSelectorForm, ReportParams) {
        // important init code at the bottom

        var toState = null;

        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        var selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            publisherId: null,
            reportType: null,
            adNetworkId: null,
            adNetworkBreakdown: null,
            siteId: null,
            siteBreakdown: null,
            adSlotId: null,
            adSlotBreakdown: null,
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

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                'This Month': [moment().startOf('month'), moment().subtract(1, 'days')],
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

        var reportTypeOptions = [
            {
                key: PERFORMANCE_REPORT_TYPES.account,
                breakdownKey: 'accountBreakdown',
                label: 'Account',
                toState: 'reports.performance.account'
            },
            {
                key: PERFORMANCE_REPORT_TYPES.adNetwork,
                breakdownKey: 'adNetworkBreakdown',
                label: 'Ad Network',
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
            },
            {
                key: PERFORMANCE_REPORT_TYPES.site,
                breakdownKey: 'siteBreakdown',
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
                    },
                    {
                        key: 'adnetwork',
                        label: 'By Ad Network',
                        toState: 'reports.performance.siteAdNetworks'
                    }
                ]
            },
            {
                key: PERFORMANCE_REPORT_TYPES.adSlot,
                breakdownKey: 'adSlotBreakdown',
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
            },
            {
                key: PERFORMANCE_REPORT_TYPES.ronAdSlot,
                breakdownKey: 'ronAdSlotBreakdown',
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
            }
        ];

        if (isAdmin) {
            reportTypeOptions.unshift({
                key: PERFORMANCE_REPORT_TYPES.platform,
                breakdownKey: 'platformBreakdown',
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
         * i.e "All Ad Networks" option. We filter out these values if the user is searching specifically for a value
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

        function selectPublisher() {
            resetForm();
        }

        /**
         *
         * @param {Object} reportType
         */
        function selectReportType(reportType) {
            $scope.selectedData.siteId = null;

            if (!angular.isObject(reportType) || !reportType.toState) {
                throw new Error('report type is missing a target state');
            }

            if(reportType.key == $scope.reportTypes.ronAdSlot) {
                getRonAdSlot()
            }

            toState = reportType.toState;

        }

        function selectEntity(entityId) {
            $scope.selectedData.siteBreakdown = null;
            $scope.selectedData.adSlotBreakdown = null;
            $scope.selectedData.adNetworkBreakdown = null;
            $scope.selectedData.accountBreakdown = null;
            resetToStateForCurrentReportType();
        }

        function selectAdNetwork(adNetworkId) {
            $scope.selectedData.adNetworkBreakdown = null;
            $scope.selectedData.siteId = null;

            if(adNetworkId){
                reportSelectorForm.getSiteForAdNetwork(adNetworkId)
                    .then(function(site) {
                        addAllOption(site, 'All Sites');
                        $scope.optionData.adNetworkSites  = site;
                    }
                );
            }

            resetToStateForCurrentReportType();
        }

        // reset toState of ad network
        function selectSiteForAdNetwork(siteId) {
            $scope.selectedData.adNetworkBreakdown = null;

            if(!siteId) {
                return $scope.selectedData.reportType.breakdownOptions = [
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
            $scope.selectedData.siteBreakdown = null;
            $scope.selectedData.adSlotBreakdown = null;
            $scope.selectedData.adSlotId = null;
            resetToStateForCurrentReportType();

            hasGetAdSlot = false;
            getAdSlot(siteId);
        }

        function getAdSlot(siteId) {
            if(hasGetAdSlot) {
                return
            }

            hasGetAdSlot = true;

            if(toState == 'reports.performance.adSlots') {
                reportSelectorForm.getAdSlotsForSite(siteId)
                    .then(function(adSlots) {
//                        addAllOption(adSlots, 'All AdSlots');
                        $scope.optionData.adSlots = adSlots;
                    }
                );
            }
        }

        function getRonAdSlot() {
            if(hasGetRonAdSlot) {
                return
            }

            hasGetRonAdSlot = true;

            reportSelectorForm.getRonAdSlot()
                .then(function(ronAdSlots) {
                    $scope.optionData.ronAdSlots = ronAdSlots;
                }
            );
        }

        function selectedPublisherRonAdSlot(ronAdSlot) {
            if(!isAdmin) {
                return true;
            }

            else if(ronAdSlot.libraryAdSlot.publisher.id == $scope.selectedData.publisherId) {
                return true
            }

            return false
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
                selectBreakdownOption(breakdownOption);
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

        /////

        function init() {
            if (isAdmin) {
                reportSelectorForm.getPublishers()
                    .then(function (data) {
                        $scope.optionData.publishers = data;
                    })
                ;
            }

            reportSelectorForm.getAdNetworks()
                .then(function (data) {
                    addAllOption(data, 'All Ad Networks');

                    $scope.optionData.adNetworks = data;
                })
            ;

            reportSelectorForm.getSites()
                .then(function (data) {

                    addAllOption(data, 'All Sites');
                    $scope.optionData.sites = data;
                })
            ;

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

                    angular.extend($scope.selectedData, _.omit(calculatedParams, ['reportType']));

                    if (!$scope.selectedData.date.endDate) {
                        $scope.selectedData.date.endDate = $scope.selectedData.date.startDate
                    }
                }
            );
        }

        init();
        $scope.$on('$stateChangeSuccess', update);
    }
})();