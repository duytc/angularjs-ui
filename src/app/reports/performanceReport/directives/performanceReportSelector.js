angular.module('tagcade.reports.performanceReport')

    .directive('performanceReportSelector', function(PERFORMANCE_REPORT_EVENTS, Auth, ReportSelector, AlertService, REPORT_DATE_FORMAT) {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/performanceReportSelector.tpl.html',
            controller: function($scope, $rootScope) {
                $scope.isAdmin = Auth.isAdmin();
                $scope.isCollapsed = ReportSelector.wasInitialized();
                $scope.formProcessing = false;

                $scope.datePickerOpts = {
                    format: REPORT_DATE_FORMAT,
                    minDate: null, // user join date
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

                // these are binding to the service objects by reference!
                $scope.criteria = ReportSelector.getCriteria();
                $scope.reportTypes = ReportSelector.getReportTypes();
                $scope.entityFieldData = ReportSelector.getEntityFieldData();

                /**
                 *
                 * @param field
                 * @param reportType
                 * @returns {Boolean}
                 */
                $scope.fieldShouldBeVisible = function (field, reportType) {
                    return ReportSelector.fieldShouldBeVisible(field, reportType);
                };

                $scope.selectReportType = function (reportType) {
                    ReportSelector.selectReportType(reportType);
                };

                $scope.selectPublisher = function (publisher, publisherId) {
                    ReportSelector.selectPublisher(publisher, publisherId);
                };

                $scope.selectSite = function (site, siteId) {
                    ReportSelector.selectSite(site, siteId);
                };

                $scope.selectAdSlot = function (adSlot, adSlotId) {
                    ReportSelector.selectAdSlot(adSlot, adSlotId);
                };

                $scope.isFormValid = function() {
                    return $scope.reportSelectorForm.$valid;
                };

                $scope.submit = function() {
                    if ($scope.formProcessing) {
                        // already running, prevent duplicate
                        return;
                    }

                    $scope.formProcessing = true;

                    if ($rootScope.$broadcast(PERFORMANCE_REPORT_EVENTS.formSubmit, ReportSelector.getCriteriaSummary()).defaultPrevented) {
//                        AlertService.replaceAlerts({
//                            type: 'error',
//                            message: 'The report could not be loaded'
//                        });
                    } else {
                        $scope.isCollapsed = true;
                    }

                    $scope.formProcessing = false;
                };
            }
        };
    })

;