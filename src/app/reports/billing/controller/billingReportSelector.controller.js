(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReportSelector', BillingReportSelector)
    ;

    function BillingReportSelector($scope, $q, $state, _, Auth, UserStateHelper, AlertService, ReportParams, billingService, REPORT_TYPES, selectorFormCalculator) {
        var toState;
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        var selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            reportType: null,
            publisherId: null,
            siteId: null
        };

        $scope.selectedData = selectedData;

        $scope.optionData = {
            publishers: []
        };

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

        $scope.showPublisherSelect = showPublisherSelect;
        $scope.selectedReportTypeis = selectedReportTypeis;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.getReports = getReports;
        $scope.selectReportType = selectReportType;
        $scope.reportTypes = REPORT_TYPES;

        var reportTypeOptions = [
            {
                key: REPORT_TYPES.account,
                label: 'Account',
                toState: 'reports.billing.accountReport'
            },
            {
                key: REPORT_TYPES.site,
                label: 'Site',
                toState: 'reports.billing.site'
            }
        ];

        if (isAdmin) {
            reportTypeOptions.unshift({
                key: REPORT_TYPES.platform,
                label: 'Platform',
                toState: 'reports.billing.platform'
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
                billingService.getPublishers()
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            }

            billingService.getSites()
                .then(function (data) {
                    $scope.optionData.sites = data;
                })
            ;

            var initialParams = billingService.getInitialParams();
            if (initialParams == null) {
                return;
            }

            selectorFormCalculator.getCalculatedParams(initialParams).then(
              function(calculatedParams) {

                  var reportType = findReportType(calculatedParams.reportType) || null;
                  $scope.selectedData.reportType = reportType;

                  var initialData = {
                      date: {
                          startDate: null,
                          endDate: null
                      },
                      publisherId: null,
                      reportType: reportType
                  };

                  angular.extend(initialData, _.omit(calculatedParams, ['reportType']));


                  if(!initialData.date.endDate) {
                      initialData.date.endDate = initialData.date.startDate;
                  }

                  if (!initialData.date.startDate) {
                      angular.extend(initialData, {
                          date: {
                              startDate: moment().subtract(7, 'days').startOf('day'),
                              endDate: moment().subtract(1, 'days').startOf('day')
                          }
                      })
                  }

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
                        message: 'An error occurred trying to request the report'
                    });
                })
            ;
        }
    }
})();