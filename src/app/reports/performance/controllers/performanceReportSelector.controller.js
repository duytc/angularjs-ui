(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('PerformanceReportSelector', PerformanceReportSelector)
    ;

    function PerformanceReportSelector($scope, $q, $state, _, PERFORMANCE_REPORT_TYPES, Auth, UserStateHelper, AlertService, performanceReport, reportSelectorForm, ReportParams) {
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
            siteBreakdown: null
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
            sites: []
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
        $scope.selectBreakdownOption = selectBreakdownOption;
        $scope.getReports = getReports;

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.reportTypes = PERFORMANCE_REPORT_TYPES;

        var reportFields = {
            publisher: 'publisher',
            adNetwork: 'adnetwork',
            site: 'site',
            adSlot: 'adSlot'
        };

        $scope.reportFields = reportFields;

        var reportTypeOptions = [
            {
                key: PERFORMANCE_REPORT_TYPES.account,
                label: 'Account',
                toState: 'reports.performance.account'
            },
            {
                key: PERFORMANCE_REPORT_TYPES.adNetwork,
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
            },
            {
                key: PERFORMANCE_REPORT_TYPES.adSlot,
                label: 'Ad Slot',
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
            }
        ];

        if (isAdmin) {
            reportTypeOptions.unshift({
                key: PERFORMANCE_REPORT_TYPES.platform,
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

        function isFormValid() {
            return $scope.reportSelectorForm.$valid;
        }

        function showReportTypeSelect() {
            if (!isAdmin) {
                //$scope.reportTypeOptions.splice(0, 1);
            }

            return true;
//            if (!isAdmin) {
//                return true;
//            }
//
//            return $scope.reportSelectorForm.publisher.$valid;
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
            if (!angular.isObject(reportType) || !reportType.toState) {
                throw new Error('report type is missing a target state');
            }

            toState = reportType.toState;
        }

        function selectEntity(entityId) {
            if (entityId === null) {
                resetToStateForCurrentReportType();
            }
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
                        message: 'An error occurred trying to request the report'
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
                $scope.selectedData.date.startDate = moment().startOf('day');
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

            var reportType = findReportType(params.reportType) || null;
            $scope.selectedData.reportType = reportType;

            resetForm();

            angular.extend($scope.selectedData, _.omit(params, ['reportType']));

            if (!$scope.selectedData.date.endDate) {
                $scope.selectedData.date.endDate = $scope.selectedData.date.startDate
            }
        }

        init();
        $scope.$on('$stateChangeSuccess', update);
    }
})();