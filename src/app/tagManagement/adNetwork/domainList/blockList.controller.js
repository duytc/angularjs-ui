(function() {
    'use strict';

    angular.module('tagcade.tagManagement.domainList')
        .controller('BlockList', BlockList)
    ;

    function BlockList($scope, $translate, $stateParams, $modal, AlertService, domainList, adNetwork, DisplayBlackListManager, AdNetworkManager, AtSortableService, EVENT_ACTION_SORTABLE, HISTORY_TYPE_PATH, historyStorage, ITEMS_PER_PAGE) {
        $scope.domainList = domainList;
        $scope.adNetwork = adNetwork;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;
        $scope.changeItemsPerPage = changeItemsPerPage;
        $scope.changePage = changePage;

        $scope.hasData = function () {
            return !!domainList && !!domainList.records.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('DOMAIN_LIST_MODULE.CURRENTLY_NO_BLACK_LIST')
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(domainList.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        var params = {
            page: 1
        };

        var getDomainList;

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.backToListAdNetwork = backToListAdNetwork;
        $scope.viewDomains = viewDomains;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDomainList(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getDomainList(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDomainList(params);
        }

        function _getDomainList(query, ms) {
            clearTimeout(getDomainList);

            getDomainList = setTimeout(function() {
                params = query;
                var Manage = !!adNetwork ? AdNetworkManager.one(adNetwork.id).one('displayblacklists') : DisplayBlackListManager.one();

                return Manage.get(query)
                    .then(function(domainList) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.domainList = domainList;
                        $scope.tableConfig.totalItems = Number(domainList.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        function viewDomains(item) {
            $modal.open({
                templateUrl: 'tagManagement/adNetwork/domainList/viewDomains.tpl.html',
                controller: 'ViewDomains',
                size: 'lg',
                resolve: {
                    domain: function(DisplayBlackListManager){
                        return DisplayBlackListManager.one(item.id).get();
                    },
                    whiteList: false
                }
            });
        }

        function backToListAdNetwork() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adNetwork, '^.^.adNetwork.list');
        }

        function confirmDeletion(domain, index) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/domainList/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return DisplayBlackListManager.one(domain.id).remove()
                    .then(
                    function () {
                        _getDomainList(params);

                        AlertService.replaceAlerts({
                            type: 'success',
                            message:  $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.domainList.records) && $scope.domainList.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function changeItemsPerPage()
        {
            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            _getDomainList(params, 500);
        }


        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.blockList)
        });
    }
})();