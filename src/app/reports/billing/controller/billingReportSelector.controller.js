(function() {
    'use strict';

    angular.module('tagcade.reports.billing')
        .controller('BillingReportSelector', BillingReportSelector)
    ;

    function BillingReportSelector($scope, $stateParams, $translate, $q, $state, _, Auth, UserStateHelper, AlertService, ReportParams, billingService, HeaderBiddingReport, performanceReport, adminUserManager, REPORT_TYPES, USER_MODULES, reportSelectorForm, selectorFormCalculator, UISelectMethod) {
        var toState;

        var isAdmin = Auth.isAdmin();
        var userSession = Auth.getSession();
        $scope.isAdmin = isAdmin;

        var selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            product: (!$stateParams.product || $stateParams.product == 'display') ? 'display' : 'video',
            publisherId: null,
            reportType: null,
            siteId: null,
            siteBreakdown: null,
            breakdown: null
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

        $scope.reportTypes = REPORT_TYPES;
        $scope.groupEntities = UISelectMethod.groupEntities;
        $scope.isFormValid = isFormValid;
        $scope.showPublisherSelect = showPublisherSelect;
        $scope.selectedReportTypeis = selectedReportTypeis;
        $scope.selectPublisher = selectPublisher;
        $scope.selectReportType = selectReportType;
        $scope.selectBreakdownOption = selectBreakdownOption;
        $scope.getReports = getReports;
        $scope.selectEntity = selectEntity;
        $scope.selectProduct = selectProduct;

        $scope.productOptions = [
            {
                key: 'display',
                label: 'Display'
            }
        ];

        if(userSession.hasModuleEnabled(USER_MODULES.videoAds)) {
            $scope.productOptions.push(
                {
                    key: 'video',
                    label: 'Video'
                }
            )
        }

        if(userSession.hasModuleEnabled(USER_MODULES.headerBidding)) {
            $scope.productOptions.push(
                {
                    key: 'headerBidding',
                    label: 'Header Bidding'
                }
            )
        }

        if(userSession.hasModuleEnabled(USER_MODULES.inBanner)) {
            $scope.productOptions.push(
                {
                    key: 'inBanner',
                    label: 'In Banner'
                }
            )
        }

        var reportTypeForDisplayOptions = [
            {
                key: REPORT_TYPES.account,
                breakdownKey: 'accountBreakdown',
                label: 'Account',
                toState: 'reports.billing.account'
            }
        ];

        var reportTypeForInBannerOptions = [
            {
                key: REPORT_TYPES.account,
                breakdownKey: 'accountBreakdown',
                label: 'Account',
                toState: 'reports.billing.account'
            }
        ];

        var reportTypeForVideoOptions = [
            {
                key: REPORT_TYPES.account,
                label: 'Account',
                toState: 'reports.billing.video'
            }
        ];

        var reportTypeForHeaderBiddingOptions = [
            {
                key: REPORT_TYPES.account,
                label: 'Account',
                breakdownKey: 'accountBreakdown',
                toState: 'reports.billing.hbAccount'
            },
            {
                key: REPORT_TYPES.site,
                label: 'Site',
                toState: 'reports.billing.hbSites',
                breakdownKey: 'siteBreakdown',
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.billing.hbSite'
                    }
                ]
            }
        ];

        if (isAdmin) {
            reportTypeForDisplayOptions.unshift({
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
                    }
                ]
            });

            reportTypeForInBannerOptions.unshift({
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
                    }
                ]
            });

            reportTypeForVideoOptions.unshift({
                key: REPORT_TYPES.platform,
                label: 'Platform',
                toState: 'reports.billing.video',
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.billing.video'
                    },
                    {
                        key: 'publisher',
                        label: 'By Account',
                        toState: 'reports.billing.video'
                    }
                ]
            });

            reportTypeForHeaderBiddingOptions.unshift({
                key: REPORT_TYPES.platform,
                label: 'Platform',
                toState: 'reports.billing.hbPlatform',
                breakdownOptions: [
                    {
                        key: 'day',
                        label: 'By Day',
                        toState: 'reports.billing.hbPlatform'
                    },
                    {
                        key: 'account',
                        label: 'By Account',
                        toState: 'reports.billing.hbPlatformAccounts'
                    }
                ]
            })
        }

        if($stateParams.product == 'video') {
            $scope.reportTypeOptions = reportTypeForVideoOptions;
        } else if($stateParams.product == 'headerBidding') {
            $scope.reportTypeOptions = reportTypeForHeaderBiddingOptions;
        } else if($stateParams.product == 'inBanner') {
            $scope.reportTypeOptions = reportTypeForInBannerOptions;
        } else {
            // set default report for display
            $scope.reportTypeOptions = reportTypeForDisplayOptions;
        }

        /**
         *
         * @param {Object} reportType
         */
        function selectReportType(reportType) {
            if($scope.selectedData.product == 'video') {
                $scope.selectedData.publisherId = null;
                $scope.selectedData.breakdown = null;
            }

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
            return _.findWhere($scope.reportTypeOptions, { key: reportTypeKey });
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
            $scope.selectedData.siteBreakdown = null;
            toState = $scope.selectedData.reportType.toState;

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
            if(product.key == 'display') {
                $scope.reportTypeOptions = reportTypeForDisplayOptions;
            }

            if(product.key == 'video') {
                $scope.reportTypeOptions = reportTypeForVideoOptions;
            }

            if(product.key == 'headerBidding') {
                $scope.reportTypeOptions = reportTypeForHeaderBiddingOptions;
            }

            if(product.key == 'inBanner') {
                $scope.reportTypeOptions = reportTypeForInBannerOptions;
            }


            $scope.selectedData.reportType = null;
            $scope.selectedData.publisherId = null;
            $scope.selectedData.breakdown = null;
            $scope.selectedData.platformBreakdown = null;
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
            var params = ReportParams.getFormParams($stateParams.product == 'display' || $stateParams.product == 'inBanner' || !$stateParams.product ? performanceReport.getInitialParams() : HeaderBiddingReport.getInitialParams());

            params = params || {};

            if (!_.isObject(params)) {
                return;
            }

            reportSelectorForm.getCalculatedParams(params).then(
                function (calculatedParams) {
                    var reportType = findReportType(calculatedParams.reportType) || null;
                    calculatedParams.product = !!$stateParams.product ? $stateParams.product : 'display';

                    // update params when refresh for product is video
                    if($stateParams.product == 'video') {
                        calculatedParams.breakdown = $stateParams.breakdown;
                        calculatedParams.publisherId = $stateParams.publisherId;
                        calculatedParams.date = {
                            endDate: $stateParams.endDate,
                            startDate: $stateParams.startDate
                        };

                        $scope.reportTypeOptions = reportTypeForVideoOptions;
                        reportType =  _.find(reportTypeForVideoOptions, function(rpt) {
                            return $stateParams.reportTypeClone == rpt.key;
                        });
                    } else if($stateParams.product == 'display') {
                        $scope.reportTypeOptions = reportTypeForDisplayOptions;
                    } else if($stateParams.product == 'inBanner') {
                        $scope.reportTypeOptions = reportTypeForInBannerOptions;
                    } if($stateParams.product == 'headerBidding') {
                        $scope.reportTypeOptions = reportTypeForHeaderBiddingOptions;
                    }

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
            params.reportTypeClone = params.reportType.key;

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