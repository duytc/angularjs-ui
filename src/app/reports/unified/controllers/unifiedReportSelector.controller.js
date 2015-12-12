(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .controller('UnifiedReportSelector', UnifiedReportSelector)
    ;

    function UnifiedReportSelector($scope, $stateParams, $translate, $q, $state, _, Auth, adminUserManager, PartnerManager, UserStateHelper, AlertService, ReportParams, unifiedReport, REPORT_TYPE_KEY, UISelectMethod) {
        var toState = null;

        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        var reportTypeKey = REPORT_TYPE_KEY;
        $scope.reportTypeKey = reportTypeKey;

        var adNetworkSupportReportType = [];
        $scope.selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            publisher: null,
            adNetwork: null,
            reportType: null,
            breakDown: null,
            page: 1
        };

        $scope.optionData = {
            publishers: [],
            adNetworks: []
        };

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

        $scope.getReports = getReports;
        $scope.selectBreakdownOption = selectBreakdownOption;
        $scope.isFormValid = isFormValid;
        $scope.selectPublisher = selectPublisher;
        $scope.getPartnerForPublisher = getPartnerForPublisher;
        $scope.selectAdNetwork = selectAdNetwork;
        $scope.selectReportType = selectReportType;
        $scope.filterReportTypeForAdNetwork = filterReportTypeForAdNetwork;
        $scope.filterDrillDownForReportType = filterDrillDownForReportType;

        // beak down is displayed when beak down support
        $scope.breakdownOptions = [
            {
                key: 'day',
                label: 'By Day',
                toState: 'reports.unified.day',
                supportReportType: [reportTypeKey.adTag, reportTypeKey.dailyStats, reportTypeKey.site, reportTypeKey.adTagGroup]
            },
            {
                key: 'site',
                label: 'By Site',
                toState: 'reports.unified.site',
                supportReportType: [reportTypeKey.adTag]
            },
            {
                key: 'country',
                label: 'By Country',
                toState: 'reports.unified.country',
                supportReportType: [reportTypeKey.adTag, reportTypeKey.adTagGroup]
            }
        ];

        // report type is displayed when ad network have supportReportType
        $scope.reportTypeOptions = [
            {
                key: reportTypeKey.dailyStats,
                label: 'Daily Stats'
            },
            {
                key: reportTypeKey.adTag,
                label: 'Ad Tag'
            },
            {
                key: reportTypeKey.adTagGroup,
                label: 'Ad Tag Group'
            },
            {
                key: reportTypeKey.site,
                label: 'Site'
            }
        ];

        function selectPublisher(publisherId) {
            $scope.selectedData.adNetwork = null;
            $scope.selectedData.breakDown = null;

            getPartnerForPublisher(publisherId)
        }

        function selectAdNetwork(adNetwork) {
            if (!angular.isObject(adNetwork) || !adNetwork.reportTypes) {
                throw new Error('no report type');
            }

            $scope.selectedData.reportType = null;
            adNetworkSupportReportType = adNetwork.reportTypes;
        }

        function selectReportType(reportType) {
            $scope.selectedData.breakDown = null;

            if(reportTypeKey.dailyStats == reportType.key) {
                $scope.selectedData.breakDown = $scope.breakdownOptions[0].key
            }
        }

        function filterReportTypeForAdNetwork(type) {
            return adNetworkSupportReportType.indexOf(type.key) > -1
        }

        function filterDrillDownForReportType(option) {
            return option.supportReportType.indexOf($scope.selectedData.reportType) > -1;
        }

        function getPartnerForPublisher(publisherId) {
            PartnerManager.getList({publisher: publisherId})
                .then(function(partner) {
                    $scope.optionData.adNetworks = partner.plain();
                    //UISelectMethod.addAllOption($scope.optionData.adNetworks, 'Over All');

                    _setAdNetworkSupport()
                });
        }

        function selectBreakdownOption(breakdownOption) {
            if (!angular.isObject(breakdownOption) || !breakdownOption.toState) {
                throw new Error('breakdown option is missing a target state');
            }

            toState = breakdownOption.toState;
        }

        function isFormValid() {
            return $scope.reportSelectorForm.$valid;
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
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        function update() {
            var params = ReportParams.getFormParams(unifiedReport.getInitialParams());

            params = params || {};

            if (!_.isObject(params)) {
                return;
            }

            if (!params.date.startDate) {
                params.date.startDate = moment().subtract(6, 'days').startOf('day');
            }

            if (!params.date.endDate) {
                params.date.endDate = (new Date(params.date.startDate).toDateString() == new Date().toDateString()) ? params.date.startDate : moment().subtract(1, 'days').startOf('day');
            }

            angular.extend($scope.selectedData, params);
        }

        function init() {
            if (isAdmin) {
                adminUserManager.getList({ filter: 'publisher' })
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            } else {
                PartnerManager.getList()
                    .then(function(partner) {
                        $scope.optionData.adNetworks = partner.plain();
                        //UISelectMethod.addAllOption($scope.optionData.adNetworks, 'Over All');

                        _setAdNetworkSupport();
                    });
            }

            if(!$stateParams.startDate) {
                unifiedReport.resetParams();
            }

            if(!!$stateParams.publisher) {
                getPartnerForPublisher($stateParams.publisher);
            }

            update();
        }

        function _setAdNetworkSupport() {
            if(!!$stateParams.adNetwork) {
                var adNetwork = _.findWhere($scope.optionData.adNetworks, {id: $stateParams.adNetwork});

                adNetworkSupportReportType = adNetwork.reportTypes;
            }
        }

        init();
        update();
        $scope.$on('$stateChangeSuccess', update);
    }
})();