(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .controller('ProjectedBillSelector', ProjectedBillSelector)
    ;

    function ProjectedBillSelector($scope, $translate, $q, $state, _, Auth, UserStateHelper, AlertService, projectedBillService, ReportParams, REPORT_TYPES, selectorFormCalculator) {
        var toState;
        var isAdmin = Auth.isAdmin();
        var isSubPublisher = Auth.isSubPublisher();

        $scope.isAdmin = isAdmin;

        var selectedData = {
            reportType: null,
            publisherId: isSubPublisher || null,
            siteId: null
        };

        $scope.selectedData = selectedData;

        $scope.optionData = {
            publishers: []
        };

        $scope.showPublisherSelect = showPublisherSelect;
        $scope.selectedReportTypeis = selectedReportTypeis;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.getReports = getReports;
        $scope.selectReportType = selectReportType;
        $scope.reportTypes = REPORT_TYPES;

        var reportTypeOptions = [
            {
                key: REPORT_TYPES.site,
                label: 'Site',
                toState: 'reports.projectedBill.site'
            }
        ];

        if (!isSubPublisher) {
            reportTypeOptions.unshift({
                key: REPORT_TYPES.account,
                label: 'Account',
                toState: 'reports.projectedBill.account'
            });
        }

        if (isAdmin) {
            reportTypeOptions.unshift({
                key: REPORT_TYPES.platform,
                label: 'Platform',
                toState: 'reports.projectedBill.platform'
            });
        }

        $scope.reportTypeOptions = reportTypeOptions;

        init();

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

        /**
         *
         * @param {String} reportTypeKey
         * @return {Object|Boolean}
         */
        function findReportType(reportTypeKey) {
            return _.findWhere(reportTypeOptions, { key: reportTypeKey });
        }


        function init() {
            if (isAdmin) {
                projectedBillService.getPublishers()
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            }

            projectedBillService.getSites()
                .then(function (data) {
                    $scope.optionData.sites = data;
                })
            ;

            var initialParams = projectedBillService.getInitialParams();
            if (initialParams == null) {
                return;
            }

            selectorFormCalculator.getCalculatedParams(initialParams).then(
                function(calculatedParams) {

                    var reportType = findReportType(calculatedParams.reportType) || null;
                    $scope.selectedData.reportType = reportType;

                    var initialData = {
                        publisherId: null,
                        reportType: reportType
                    };

                    angular.extend(initialData, _.omit(calculatedParams, ['reportType']));

                    angular.extend($scope.selectedData, initialData);
                }
            );
        }

        function selectPublisher() {
            return $scope.selectedData.siteId = null;
        }

        function showPublisherSelect() {
            return isAdmin && $scope.reportSelectorForm.reportType.$valid;
        }

        function selectedReportTypeis(reportTypeKey) {
            var reportType = $scope.selectedData.reportType;

            if (!angular.isObject(reportType)) {
                return false;
            }

            return reportType.key == reportTypeKey;
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
    }
})();