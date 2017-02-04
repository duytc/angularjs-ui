(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('ReportViewShareList', ReportViewShareList);

    function ReportViewShareList($scope, $modal, listShare, dataSetsFromReportView, reportView, AlertService, UnifiedReportViewManager, unifiedReportBuilder, historyStorage, HISTORY_TYPE_PATH) {
        $scope.listShare = listShare;
        $scope.dataSetsFromReportView = dataSetsFromReportView;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.hasAdTags = function () {
            return !!listShare.length;
        };

        $scope.revokeShare = revokeShare;
        $scope.getFullNameField = getFullNameField;
        $scope.backToListReportView = backToListReportView;
        $scope.showPagination = showPagination;
        
        function showPagination() {
            return angular.isArray($scope.listShare) && $scope.listShare.length > $scope.tableConfig.itemsPerPage;
        }
        
        function backToListReportView() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportView, '^.listReportView');
        }
        
        function getFullNameField(field) {
            return unifiedReportBuilder.parseFieldNameByDataSet(field, dataSetsFromReportView);
        }

        function revokeShare(item) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/report/confirmRevoke.tpl.html'
            });

            modalInstance.result.then(function () {
                return UnifiedReportViewManager.one(reportView.id).one('revokesharekey').get({token: item.token})
                    .then(
                        function () {
                            var index = listShare.indexOf(item);

                            if (index > -1) {
                                listShare.splice(index, 1);
                            }

                            $scope.listShare = listShare;

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The shareable link was revoked'
                            });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: 'The shareable link could not be revoked'
                            });
                        }
                    )
                    ;
            });
        }
    }
})();