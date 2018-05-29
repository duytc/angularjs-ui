(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportView', UnifiedReportView);

    function UnifiedReportView($scope, $stateParams, $q, $translate, $modal, AlertService, reportViewList, UnifiedReportViewManager, dataService, UserStateHelper, AtSortableService, API_UNIFIED_END_POINT, historyStorage, HISTORY_TYPE_PATH, ITEMS_PER_PAGE, EVENT_ACTION_SORTABLE) {

        var params = $stateParams;
        var getReportViewList;

        $scope.reportViewList = reportViewList.records;
        $scope.itemsPerPageList = ITEMS_PER_PAGE;

        $scope.hasData = function () {
            return !!$scope.reportViewList.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no report views'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(reportViewList.totalRecord)
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.runReport = runReport;
        $scope.downloadReport = downloadReport;
        $scope.getShareableLink = getShareableLink;
        $scope.cloneReportView = cloneReportView;
        $scope.createTemplate = createTemplate;
        $scope.searchData = searchData;
        $scope.changeItemsPerPage = changeItemsPerPage;
        $scope.changePage = changePage;

        function changePage(currentPage) {
            params = angular.extend(params, {
                page: currentPage
            });
            _getReportViewList(params, 500);
        }

        function createTemplate() {
            $modal.open({
                templateUrl: 'unifiedReport/report/createTemplate.tpl.html',
                size: 'lg',
                controller: function ($scope, $modalInstance, tags, publishers, reportViewList, UnifiedReportViewManager) {
                    $scope.reportViewList = reportViewList;
                    $scope.publishers = publishers;
                    $scope.tags = tags;

                    $scope.template = {
                        name: null,
                        reportView: null,
                        publisher: null,
                        tags: []
                    };

                    $scope.addTag = function (query) {
                        return {
                            name: query
                        }
                    };

                    $scope.isFormValid = function () {
                        return $scope.createTemplate.$valid
                    };

                    $scope.submit = function () {
                        var tags = [];

                        angular.forEach($scope.template.tags, function (tag) {
                            tags.push(tag.name);
                        });

                        UnifiedReportViewManager.one($scope.template.reportView).one('reportviewtemplates').post(null, {
                            name: $scope.template.name,
                            tags: tags
                        })
                            .catch(
                                function (response) {
                                    $modalInstance.close();

                                    AlertService.replaceAlerts({
                                        type: 'error',
                                        message: 'The template could not be created'
                                    });
                                }
                            )
                            .then(
                                function () {
                                    $modalInstance.close();

                                    AlertService.replaceAlerts({
                                        type: 'success',
                                        message: 'The template has been created'
                                    });
                                }
                            )
                        ;
                    }
                },
                resolve: {
                    reportViewList: function (UnifiedReportViewManager) {
                        return UnifiedReportViewManager.getList().then(function (reportViews) {
                            return reportViews.plain();
                        });
                    },
                    tags: function (UnifiedReportTagManager){
                        return UnifiedReportTagManager.getList().then(function (tags){
                            return tags.plain();
                        });
                    },
                    publishers: /* @ngInject */ function (adminUserManager){
                        return adminUserManager.one('urEnabled').getList().then(function (publishers){
                            return publishers.plain();
                        });
                    }
                }
            });
        }

        function cloneReportView(reportView) {
            $modal.open({
                templateUrl: 'unifiedReport/report/cloneReportView.tpl.html',
                size: 'lg',
                resolve: {
                    reportView: function () {
                        return reportView;
                    }
                },
                controller: 'CloneReportView'
            });
        }

        function downloadReport(reportView) {
            angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
            });

            var params = angular.copy(reportView);

            if (!!params && params.subView && angular.isObject(params.masterReportView)) {
                var masterReportView = angular.copy(params.masterReportView);
                masterReportView.filters = reportView.filters;
                delete  masterReportView.id;
                delete  masterReportView.subView;
                delete  masterReportView.masterReportView;
                delete  masterReportView.name;

                reportView = angular.extend(params, masterReportView);
            }

            angular.forEach(params.reportViewDataSets, function (reportViewDataSet) {
                reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
            });

            params.masterReportView = angular.isObject(params.masterReportView) ? params.masterReportView.id : params.masterReportView;
            params.needToGroup = false;
            params.userDefineDimensions = reportView.enableCustomDimensionMetric ? params.dimensions : [];
            params.userDefineMetrics = reportView.enableCustomDimensionMetric ? params.metrics : [];

            dataService.makeHttpPOSTRequest('', params, API_UNIFIED_END_POINT + '/v1/reportview/download')
                .then(function (data) {
                    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
                    var reportName = !!reportView.name ? reportView.name : 'report-detail';

                    return saveAs(blob, [reportName + '.csv']);
                });
        }

        function runReport(reportView) {
            var transition = UserStateHelper.transitionRelativeToBaseState(
                'unifiedReport.report.detail', {
                    id: reportView.id,
                    saveReportView: true
                }
            );

            $q.when(transition)
                .catch(function (error) {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                });
        }

        function confirmDeletion(reportView, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/report/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return UnifiedReportViewManager.one(reportView.id).remove()
                    .then(
                        function () {
                            _getReportViewList(params);

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The report view was deleted'
                            });
                        },
                        function (response) {
                            if (!!response && !!response.data && !!response.data.message) {
                                AlertService.replaceAlerts({
                                    type: 'danger',
                                    message: response.data.message
                                });
                            }
                        }
                    );
            });
        }

        function getShareableLink(reportView) {
            $modal.open({
                templateUrl: 'unifiedReport/report/getShareableLink.tpl.html',
                size: 'lg',
                resolve: {
                    fieldsReportView: function (unifiedReportBuilder) {
                        return unifiedReportBuilder.summaryFieldsReportView(reportView)
                    },
                    reportView: function () {
                        var reportViewClone = angular.copy(reportView);

                        if (!!reportViewClone && reportViewClone.subView && angular.isObject(reportViewClone.masterReportView)) {
                            var masterReportView = angular.copy(reportViewClone.masterReportView);
                            masterReportView.filters = reportViewClone.filters;
                            delete  masterReportView.id;
                            delete  masterReportView.subView;
                            delete  masterReportView.masterReportView;
                            delete  masterReportView.name;

                            reportViewClone = angular.extend(reportViewClone, masterReportView);
                        }

                        return reportViewClone
                    },
                    shareable: function () {
                        //return null
                        var shareable = [];
                        _.each(_.clone(reportView).transforms, function (transform) {
                                if(transform.type === 'addCalculatedField') {
                                    shareable = shareable.concat(_.pluck(_.filter(transform.fields, function (field) {
                                        return field.autoAddShareableReport === true;
                                    }), 'field'));
                                }
                        })

                        return {fields: {fields: shareable}};
                    }
                },
                controller: 'GetShareableLink'
            });
        }

        function _getReportViewList(query, ms) {
            params = query;
            clearTimeout(getReportViewList);

            getReportViewList = setTimeout(function () {
                params = query;
                return UnifiedReportViewManager.one().get(query)
                    .then(function (reportViewList) {
                        setTimeout(function () {
                            AtSortableService.insertParamForUrl(query);
                            $scope.reportViewList = reportViewList.records;
                            $scope.tableConfig.totalItems = Number(reportViewList.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);
                        }, 0)
                    });
            }, ms || 0)

        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getReportViewList(params, 500);
        }

        function showPagination() {
            return angular.isArray($scope.reportViewList) && reportViewList.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function () {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.unifiedReportView)
        });

        function changeItemsPerPage() {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getReportViewList(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getReportViewList(params);
        });
    }
})();