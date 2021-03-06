(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('ReportViewShareList', ReportViewShareList);

    function ReportViewShareList($scope, $modal,$stateParams, listShare, dataSetsFromReportView, reportView, AlertService, UnifiedReportViewManager, unifiedReportBuilder, historyStorage, HISTORY_TYPE_PATH, ITEMS_PER_PAGE) {
        $scope.listShare = listShare;
        $scope.dataSetsFromReportView = dataSetsFromReportView;
        $scope.itemsPerPageList = ITEMS_PER_PAGE;
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
        $scope.getShareableLink = getShareableLink;
        $scope.editShareableLink = editShareableLink;
        $scope.showDateRange = showDateRange;

        $scope.$on('SHARE_LINK_UPDATED', _onShareLinkFromModalUpdated);

        function _onShareLinkFromModalUpdated(event, customFiltersWrapper) {
            _.forEach($scope.listShare, function (shareItem) {
                if(shareItem.token === customFiltersWrapper.token){
                    shareItem.fields.filters = customFiltersWrapper.customFilters;
                }
            })
        }
        function showDateRange(item) {
            if(angular.isString(item.fields.dateRange)) {
                return item.fields.dateRange
            }

            return !!item.fields.dateRange.startDate ? (item.fields.dateRange.startDate + ' - ' + item.fields.dateRange.endDate) : null
        }

        function editShareableLink(shareable) {
            $modal.open({
                templateUrl: 'unifiedReport/report/getShareableLink.tpl.html',
                size: 'lg',
                resolve: {
                    fieldsReportView: function (unifiedReportBuilder) {
                        return unifiedReportBuilder.summaryFieldsReportView(reportView)
                    },
                    reportView: function () {
                        return reportView
                    },
                    shareable: function () {
                        return shareable
                    }
                },
                controller: 'GetShareableLink'
            });
        }

        function getShareableLink(item) {
            UnifiedReportViewManager.one(reportView.id).one('shareablelink').get({token: item.token})
            .then(function (shareableLink) {
                $modal.open({
                    templateUrl: 'unifiedReport/report/getShareableLinkByToken.tpl.html',
                    size: 'lg',
                    resolve: {
                        shareableLink: function () {
                            return shareableLink
                        },
                        reportView: function () {
                            return reportView
                        }
                    },
                    controller: function ($scope, shareableLink, reportView) {
                        $scope.shareableLink = shareableLink;
                        $scope.reportView = reportView;

                        $scope.highlightText = function (shareableLink) {
                            return shareableLink;
                        };

                        $scope.getTextToCopy = function (string) {
                            return string.replace(/\n/g, '\r\n');
                        };
                    }
                });
            });
        }
        
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

                            if($scope.tableConfig.currentPage > 0 && listShare.length/10 == $scope.tableConfig.currentPage) {
                                $scope.tableConfig.currentPage =- 1;
                            }

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