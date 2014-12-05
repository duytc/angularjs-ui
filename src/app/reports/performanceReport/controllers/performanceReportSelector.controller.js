(function(moment) {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .controller('PerformanceReportSelector', PerformanceReportSelector)
    ;

    function PerformanceReportSelector($scope, _, PERFORMANCE_REPORT_TYPES, Auth, UserStateHelper, AlertService, PerformanceReport, ReportSelectorForm, ReportParams) {
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

        update();

        $scope.isFormValid = isFormValid;
        $scope.showPublisherSelect = showPublisherSelect;
        $scope.showReportTypeSelect = showReportTypeSelect;
        $scope.selectedReportTypeIs = selectedReportTypeIs;
        $scope.fieldShouldBeVisible = fieldShouldBeVisible;
        $scope.groupEntities = groupEntities;
        $scope.filterNonEntityValues = filterNonEntityValues;
        $scope.selectPublisher = selectPublisher;
        $scope.selectReportType = selectReportType;
        $scope.selectEntity = selectEntity;
        $scope.selectBreakdownOption = selectBreakdownOption;
        $scope.getReports = getReports;

        function update() {
            $scope.selectedData.date = {
                startDate: moment().startOf('day'),
                endDate: moment().startOf('day')
            };

            if (isAdmin) {
                ReportSelectorForm.getPublishers()
                    .then(function (data) {
                        $scope.optionData.publishers = data;
                    })
                ;
            }

            ReportSelectorForm.getAdNetworks()
                .then(function (data) {
                    addAllOption(data, 'All Ad Networks');

                    $scope.optionData.adNetworks = data;
                })
            ;

            ReportSelectorForm.getSites()
                .then(function (data) {
                    addAllOption(data, 'All Sites');

                    $scope.optionData.sites = data;
                })
            ;
        }

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
            site: 'site'
        };

        $scope.reportFields = reportFields;

        var reportTypeOptions = [
            {
                key: PERFORMANCE_REPORT_TYPES.account,
                label: 'Account',
                toState: 'reports.performanceReport.account'
            },
            {
                key: PERFORMANCE_REPORT_TYPES.adNetwork,
                label: 'Ad Network',
                toState: 'reports.performanceReport.adNetworks',
                visibleFields: [reportFields.adNetwork],
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performanceReport.adNetwork'
                    },
                    {
                        key: '',
                        label: 'By Site',
                        toState: 'reports.performanceReport.adNetworkSites'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performanceReport.adNetworkAdTags'
                    }
                ]
            },
            {
                key: PERFORMANCE_REPORT_TYPES.site,
                label: 'Site',
                toState: 'reports.performanceReport.sites',
                visibleFields: [reportFields.site],
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.performanceReport.site'
                    },
                    {
                        key: 'adslot',
                        label: 'By Ad Slot',
                        toState: 'reports.performanceReport.siteAdSlots'
                    },
                    {
                        key: 'adtag',
                        label: 'By Ad Tag',
                        toState: 'reports.performanceReport.siteAdTags'
                    }
                ]
            }
        ];

        $scope.reportTypeOptions = reportTypeOptions;

        function isFormValid() {
            return angular.isString(toState) && $scope.reportSelectorForm.$valid;
        }

        function showPublisherSelect() {
            return isAdmin;
        }

        function showReportTypeSelect() {
            if (!isAdmin) {
                return true;
            }

            return $scope.reportSelectorForm.publisher.$valid;
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

        function selectedReportTypeIs(reportType) {
            var selectedReportType = $scope.selectedData.reportType;

            return angular.isObject(selectedReportType) && selectedReportType.key === reportType;
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

        function selectReportType(reportType) {
            if (!angular.isObject(reportType) || !reportType.toState) {
                throw new Error('report type is missing a target state');
            }

            toState = reportType.toState;
        }

        function selectEntity(entityId) {
            console.log(entityId);

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
            var params = ReportParams.getStateParams($scope.selectedData);

            UserStateHelper.transitionRelativeToBaseState(toState, params)
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred trying to request the report'
                    });

                    return false;
                })
            ;
        }
    }
})(window.moment);