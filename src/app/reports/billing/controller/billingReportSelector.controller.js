(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReportSelector', BillingReportSelector)
    ;

    function BillingReportSelector($scope, $translate, $q, $state, _, Auth, UserStateHelper, AlertService, ReportParams, billingService, performanceReport, adminUserManager, REPORT_TYPES, reportSelectorForm, selectorFormCalculator, UISelectMethod) {
        var toState;

        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        var selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            product: 'display',
            publisherId: null,
            reportType: null,
            siteId: null,
            siteBreakdown: null
        };

        $scope.selectedData = selectedData;

        $scope.optionData = {
            publishers: [],
            sites: []
        };

        var formDefaults = {
            selectedData: _.omit(selectedData, ['date', 'publisherId', 'reportType'])
        };

        function resetForm() {
            angular.extend($scope.selectedData, formDefaults.selectedData);
        }

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

        $scope.groupEntities = UISelectMethod.groupEntities;
        $scope.isFormValid = isFormValid;
        $scope.showPublisherSelect = showPublisherSelect;
        $scope.selectedReportTypeis = selectedReportTypeis;
        $scope.selectPublisher = selectPublisher;
        $scope.selectReportType = selectReportType;
        $scope.selectBreakdownOption = selectBreakdownOption;
        $scope.getReports = getReports;
        $scope.reportTypes = REPORT_TYPES;
        $scope.selectEntity = selectEntity;
        $scope.selectProduct = selectProduct;

        $scope.productOptions = [
            {
                key: 'display',
                label: 'Header Bidding'
            },
            //{
            //    key: 'source',
            //    label: 'Source'
            //}
        ];

        var reportTypeOptions = [
            {
                key: REPORT_TYPES.account,
                breakdownKey: 'accountBreakdown',
                label: 'Account',
                toState: 'reports.billing.account'
            },
            {
                key: REPORT_TYPES.site,
                breakdownKey: 'siteBreakdown',
                label: 'Site',
                toState: 'reports.billing.sites',
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.billing.site'
                    }
                ]
            }
        ];

        if (isAdmin) {
            reportTypeOptions.unshift({
                key: REPORT_TYPES.platform,
                breakdownKey: 'platformBreakdown',
                label: 'Platform',
                toState: 'reports.billing.platform',
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.billing.platform'
                    },
                    {
                        key: 'account',
                        label: 'By Account',
                        toState: 'reports.billing.platformAccounts'
                    },
                    {
                        key: 'site',
                        label: 'By Site',
                        toState: 'reports.billing.platformSites'
                    }
                ]
            });
        }

        $scope.reportTypeOptions = reportTypeOptions;

        /**
         *
         * @param {Object} reportType
         */
        function selectReportType(reportType) {
            if (!angular.isObject(reportType) || !reportType.toState) {
                throw new Error('report type is missing a target state');
            }

            toState = reportType.toState;
            $scope.selectedData.reportType = reportType;
            _getSitesForPublisher($scope.selectedData.publisherId);
        }

        function selectBreakdownOption(breakdownOption) {
            if (!angular.isObject(breakdownOption) || !breakdownOption.toState) {
                throw new Error('breakdown option is missing a target state');
            }

            toState = breakdownOption.toState;
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

            if(!isAdmin) {
                billingService.getSites()
                    .then(function (data) {
                        UISelectMethod.addAllOption(data, 'All Sites');
                        $scope.optionData.sites = data;
                    })
                ;
            }

            var initialParams = performanceReport.getInitialParams();
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

        function selectPublisher(publisher) {
            $scope.selectedData.siteId = null;

            _getSitesForPublisher(publisher.id);
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

        function selectProduct(product) {
        }

        function selectEntity(entityId) {
            if (entityId === null) {
                $scope.selectedData.siteBreakdown = null;
                toState = $scope.selectedData.reportType.toState;
            }
        }

        function _getSitesForPublisher(publisherId) {
            if(!isAdmin || $scope.selectedData.reportType.key != REPORT_TYPES.site || !publisherId) {
                return
            }

            adminUserManager.one(publisherId).one('sites').getList()
                .then(function (data) {
                    UISelectMethod.addAllOption(data, 'All Sites');
                    $scope.optionData.sites = data;
                })
            ;
        }

        function isFormValid() {
            return $scope.reportSelectorForm.$valid;
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
                        var breakdownOption = _.findWhere(reportType.breakdownOptions, { key: breakdownValue });
                        selectBreakdownOption(breakdownOption);
                    }
                    else{
                        toState = reportType.toState;
                    }

                    resetForm();

                    angular.extend($scope.selectedData, _.omit(calculatedParams, ['reportType']));

                    if (!$scope.selectedData.date.endDate) {
                        $scope.selectedData.date.endDate = $scope.selectedData.date.startDate
                    }

                    if(!!$scope.optionData.sites && $scope.optionData.sites.length == 0) {
                        _getSitesForPublisher($scope.selectedData.publisherId)
                    }
                }
            );
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
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        init();
        update();
        $scope.$on('$stateChangeSuccess', update);
    }
})();