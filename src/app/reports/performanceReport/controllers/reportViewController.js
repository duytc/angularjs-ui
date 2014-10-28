angular.module('tagcade.reports.performanceReport')

    .controller('ReportViewController', function (
        $rootScope, $scope, $filter, _,
        PERFORMANCE_REPORT_EVENTS, PERFORMANCE_REPORT_TYPES,
        ngTableParams, ReportSelector, DateFormatter, AlertService,
        reports
    ) {
        'use strict';

        $scope.selectReport = function (report) {
            if (!_.isString(report.reportType)) {
                return;
            }

            var requiredParams = ReportSelector.getOnlyRequiredParamsForReportType(report);

            var params = {
                startDate: DateFormatter.getFormattedDate(report.date),
                expand: true
            };

            _.extend(
                params,
                requiredParams
            );

            $rootScope.$broadcast(PERFORMANCE_REPORT_EVENTS.expandReport, report.reportType, params);
        };

        var data = reports;

        $scope.hasData = !_.isEmpty(data);

        if (!$scope.hasData) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There are no reports for that selection'
            });
        }

        $scope.tableParams = new ngTableParams( // jshint ignore:line
            {
                page: 1,
                count: 25,
                sorting: {
                    date: 'desc'
                }
            },
            {
                total: data.length,
                getData: function($defer, params) {
                    var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                    var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    $defer.resolve(paginatedData);
                }
            }
        );
    })

;