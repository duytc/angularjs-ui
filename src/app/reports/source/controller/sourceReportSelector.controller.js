(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .controller('SourceReportSelector', SourceReportSelector)
    ;

    function SourceReportSelector($scope, $translate, $stateParams, Auth, UserStateHelper, AlertService, ReportParams, sourceReport, SiteManager, adminUserManager, dateUtil) {
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        $scope.selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            publisherId: null,
            siteId : null
        };

        $scope.optionData = {
            publishers: [],
            sites : []
        };

        if(!$stateParams.siteId) {
            sourceReport.resetParams();
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

        $scope.isFormValid = isFormValid;
        $scope.getReports = getReports;
        $scope.selectPublisher = selectPublisher;

        init();

        function init() {
            if (isAdmin) {
                adminUserManager.getList({ filter: 'publisher' })
                    .then(function (users) {
                        $scope.optionData.publishers = users.plain();
                    })
                ;
            }

            SiteManager.getList().then(function (sites) {
                $scope.optionData.sites = sites.plain();
            });

            var selectedData = {
                date: {
                    startDate: null,
                    endDate: null
                },
                publisherId: null,
                siteId: null
            };

            var initialParams = sourceReport.getInitialParams();

            if (initialParams.date) {
                initialParams.startDate = initialParams.date;
                initialParams.endDate = initialParams.date;
            }

            if (!initialParams.endDate) {
                initialParams.endDate = initialParams.startDate;
            }

            selectedData.date.startDate = dateUtil.getDate(initialParams.startDate) || null;
            selectedData.date.endDate = dateUtil.getDate(initialParams.endDate) || null;
            selectedData.publisherId = initialParams.publisherId || null;
            selectedData.siteId = initialParams.siteId || null;

            if (!selectedData.date.startDate) {
                angular.extend(selectedData, {
                    date: {
                        startDate: moment().subtract(7, 'days').startOf('day'),
                        endDate: moment().subtract(1, 'days').startOf('day')
                    }
                })
            }

            angular.extend($scope.selectedData, selectedData);
        }

        function selectPublisher() {
            $scope.selectedData.siteId = null;
        }

        function isFormValid() {
            return $scope.sourceForm.$valid;
        }

        function getReports() {
            var params = ReportParams.getStateParams($scope.selectedData);

            UserStateHelper.transitionRelativeToBaseState('reports.source.siteDateRange', params)
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('SOURCE_REPORT_MODULE.GET_REPORT_FAIL')
                    });
                })
            ;
        }
    }
})();