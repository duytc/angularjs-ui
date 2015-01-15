(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReportSelector', BillingReportSelector)
    ;

    function BillingReportSelector($scope, _, Auth, UserStateHelper, AlertService, ReportParams, billingService) {
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        $scope.selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            publisherId: null
        };

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
        $scope.isFormValid = isFormValid;
        $scope.getReports = getReports;

        init();

        function init() {
            if (isAdmin) {
                billingService.getPublishers()
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            }

            var initialData = {
                date: {
                    startDate: null,
                    endDate: null
                },
                publisherId: null
            };

            var initialParams = billingService.getInitialParams();

            if (_.isObject(initialParams)) {
                angular.extend(initialData, initialParams);
            }

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

        function showPublisherSelect() {
            return isAdmin;
        }

        function isFormValid() {
            return $scope.reportSelectorForm.$valid;
        }

        function getReports() {
            var params = ReportParams.getStateParams($scope.selectedData);

            UserStateHelper.transitionRelativeToBaseState('reports.billing.accountReport', params)
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred trying to request the report'
                    });
                })
            ;
        }
    }
})();