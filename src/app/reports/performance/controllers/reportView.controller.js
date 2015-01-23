(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('ReportView', ReportView)
    ;

    /**
     * @param {Array} reportGroup.reports
     */
    function ReportView($scope, $state, $modal, _, Auth, AlertService, ReportParams, reportGroup, UserStateHelper, DateFormatter, SiteManager, AdSlotManager, AdTagManager, AdNetworkManager, adminUserManager) {
        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];

        $scope.getExportExcelFileName = getExportExcelFileName();

        $scope.tableConfig = {
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.popupReport = popupReport;
        $scope.drillDownReport = drillDownReport;
        $scope.goToEditPage = goToEditPage;
        $scope.openUpdateCpm = openUpdateCpm;

        if (!$scope.hasResult) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There are no reports for that selection'
            });
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function popupReport(relativeToState, report) {
            if(!Auth.isAdmin() && relativeToState == '^.sites') {
                return drillDownReport(relativeToState, report);
            }

            var confirmPopUp = $modal.open({
                templateUrl: getTemplateUrlPopup(relativeToState),
                size : 'lg',
                controller: 'popupReportController',
                resolve: {
                    data: function() {
                        if(relativeToState == '^.sites' || relativeToState == '^.account') {
                            var publisherId = (report.reportType == null) ? report.publisherId : report.reportType.publisherId;
                            return adminUserManager.one(publisherId).get();
                        }
                        if(relativeToState == '^.siteAdSlots' || relativeToState == '^.site' || relativeToState == '^.adNetworkSite' || relativeToState == '^.adNetworkSiteAdTags') {
                            var siteId = (report.reportType == null) ? report.siteId : report.reportType.siteId;
                            return SiteManager.one(siteId).get();
                        }
                        if(relativeToState == '^.adSlot' || relativeToState == '^.adSlotAdTags') {
                            var adSlotId = (report.reportType == null) ? report.adSlotId : report.reportType.adSlotId;
                            return AdSlotManager.one(adSlotId).get();
                        }
                        if(relativeToState == 'adTags') {
                            var adTagId = report.reportType.adTagId;
                            return AdTagManager.one(adTagId).get();
                        }
                        if(relativeToState == '^.adNetworkSites' || relativeToState == '^.adNetwork') {
                            var adNetworkId = (report.reportType == null) ? report.adNetworkId : report.reportType.adNetworkId;
                            return AdNetworkManager.one(adNetworkId).get();
                        }
                    }
                }
            });

            confirmPopUp.result.then(function () {
                return drillDownReport(relativeToState, report);
            });
        }

        function getTemplateUrlPopup(relativeToState) {
            switch(relativeToState) {
                case '^.sites':
                case '^.account':
                    return 'reports/performance/views/popup/popupForPublisher.tpl.html';

                case '^.siteAdSlots':
                case '^.site':
                case '^.adNetworkSite':
                case '^.adNetworkSiteAdTags':
                    return 'reports/performance/views/popup/popupForSites.tpl.html';

                case '^.adNetworkSites':
                case '^.adNetwork':
                    return 'reports/performance/views/popup/popupForAdNetwork.tpl.html';

                case '^.adSlot':
                case '^.adSlotAdTags':
                    return 'reports/performance/views/popup/popupForAdSlot.tpl.html';

                case 'adTags':
                    return 'reports/performance/views/popup/popupForAdTag.tpl.html';
            }
        }

        function drillDownReport(relativeToState, report) {
            if (!angular.isString(relativeToState)) {
                return;
            }

            relativeToState = $state.get(relativeToState, $state.$current);

            if (!relativeToState) {
                console.log('relative report state does not exist');
                return;
            }

            var unfilteredParams = {};

            if (_.isObject(reportGroup.reportType)) {
                _.extend(unfilteredParams, reportGroup.reportType);
            }

            _.extend(unfilteredParams, report);

            var params = ReportParams.getStateParams(unfilteredParams);

            $state.transitionTo(relativeToState, params)
                .catch(function() {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred trying to request the report'
                    });
                })
            ;
        }

        function goToEditPage(baseState, id) {
            var params = {id: id};
            UserStateHelper.transitionRelativeToBaseState(baseState, params)
        }

        function openUpdateCpm(data) {
            $modal.open({
                templateUrl: 'supportTools/cpmEditor/formCpmEditorForAdTag.tpl.html',
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    adTag: function () {
                        return AdTagManager.one(data.reportType.adTagId).get();
                    }
                }
            })
        }

        function getExportExcelFileName() {
            var reportType = reportGroup.reportType || {};
            var isArray = angular.isArray(reportType);
            var reportTypeString =  isArray ? (reportType.shift().reportType + 's'): reportType.reportType;
            if (isArray ) {
                var reportName = reportGroup.name || '';
                reportName = reportName.replace(/\./g, "-");
                reportTypeString = reportTypeString.replace(/\./g, "-" + reportName + '-');
            }
            else{
                var reportName = reportGroup.name || '';
                reportTypeString = reportTypeString.replace(/\./g, "-") + '-' + reportName;
            }

            return 'tagcade-report-' + reportTypeString + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate));
        }
    }
})();