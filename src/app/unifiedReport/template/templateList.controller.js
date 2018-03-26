(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.template')
        .controller('TemplateList', TemplateList);

    function TemplateList($scope, $stateParams, $modal, AlertService, templates, UnifiedReportTemplateManager, AtSortableService, historyStorage, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE, ITEMS_PER_PAGE) {
        $scope.templates = templates;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.changeItemsPerPage = changeItemsPerPage;

        $scope.hasData = function () {
            return !!$scope.templates && $scope.templates.totalRecord > 0;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no report templates'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(templates.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        var params = $stateParams;
        var getTemplate;

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.createReportView = createReportView;
        $scope.searchData = searchData;
        $scope.changePage = changePage;

        function createReportView(template) {
            $modal.open({
                templateUrl: 'unifiedReport/template/createReportView.tpl.html',
                size: 'lg',
                resolve: {
                    publishers: function (UnifiedReportTemplateManager) {
                        return UnifiedReportTemplateManager.one(template.id).one('publishers').getList()
                            .then(function (publishers) {
                                return publishers.plain()
                            });
                    }
                },
                controller: function ($scope, $modalInstance, Auth, publishers, UnifiedReportTemplateManager) {
                    $scope.publishers = publishers;
                    $scope.isAdmin = Auth.isAdmin();

                    $scope.reportView = {
                        name: null,
                        publisher: null
                    };

                    $scope.isFormValid = function () {
                        return $scope.createReport.$valid
                    };

                    $scope.submit = function () {
                        UnifiedReportTemplateManager.one(template.id).one('toreportview').post(null, $scope.reportView)
                            .catch(
                                function (response) {
                                    $modalInstance.close();

                                    AlertService.replaceAlerts({
                                        type: 'error',
                                        message: 'The report view could not be created'
                                    });
                                }
                            )
                            .then(
                                function () {
                                    $modalInstance.close();

                                    AlertService.replaceAlerts({
                                        type: 'success',
                                        message: 'The report view has been created'
                                    });
                                }
                            )
                        ;
                    }
                }
            });
        }
        
        function confirmDeletion(template, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/template/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return UnifiedReportTemplateManager.one(template.id).remove()
                    .then(function () {
                        _getTemplate(params);

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The report template was deleted'
                        });
                    },   function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: 'The report template could not be deleted'
                        });
                    })
            })
        }

        function showPagination() {
            return angular.isArray($scope.templates.records) && $scope.templates.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query){
            params = angular.extend(params, query);
            _getTemplate(params);
        });

        function changePage(currentPage){
            params = angular.extend(params, {
                page: currentPage
            });
            _getTemplate(params);
        }

        function searchData(){
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getTemplate(params, 500);
        }

        function _getTemplate(query, ms){
            clearTimeout(getTemplate);

            getTemplate = setTimeout(function (){
                return UnifiedReportTemplateManager.one().get(query)
                    .then(function (templates){
                        AtSortableService.insertParamForUrl(query);

                        setTimeout(function (){
                            $scope.templates = templates;
                            $scope.tableConfig.totalItems = Number(templates.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);
                        }, 0)
                    });
            }, ms || 0)

        }

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params = angular.extend(params, query);
            _getTemplate(params, 500);
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.template)
        });
    }
})();