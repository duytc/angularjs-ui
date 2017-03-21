(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('ViewQuicklyBlockList', ViewQuicklyBlockList)
    ;

    function ViewQuicklyBlockList($scope, Auth, $translate, $modal, AlertService, domainList, BlockListManager, AtSortableService) {
        $scope.domainList = domainList;
        $scope.isAdmin = Auth.isAdmin();

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.editQuicklyWhiteLink = editQuicklyWhiteLink;
        $scope.editQuicklyBlockLink = editQuicklyBlockLink;
        $scope.viewDomains = viewDomains;

        function viewDomains(item) {
            $modal.open({
                templateUrl: 'videoManagement/domainList/viewDomains.tpl.html',
                controller: function($scope, domains) {
                    $scope.domains = [];

                    angular.forEach(domains, function(domain) {
                        $scope.domains.push({
                            name: domain
                        })
                    })
                },
                size: 'lg',
                resolve: {
                    domains: function(){
                        return item.domains;
                    }
                }
            });
        }

        function editQuicklyWhiteLink(domain) {
            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/domainList/domainListQuicklyForm.tpl.html',
                controller: 'DomainListQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function(){
                        return null;
                    },
                    publisher: function() {
                        return null
                    },
                    blackList: function() {
                        return false;
                    },
                    domain: function() {
                        return domain
                    }
                }
            });

            modalInstance.result.then(function () {

            })
        }

        function editQuicklyBlockLink(domain) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adNetwork/domainList/blockListQuicklyForm.tpl.html',
                controller: 'BlockListQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function(){
                        return null;
                    },
                    publisher: function() {
                        return null
                    },
                    domain: function() {
                        return domain
                    }
                }
            });

            modalInstance.result.then(function () {

            })
        }

        function confirmDeletion(domain, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adNetwork/domainList/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return BlockListManager.one(domain.id).remove()
                    .then(
                    function () {
                        var index = domainList.indexOf(domain);

                        if (index > -1) {
                            domainList.splice(index, 1);
                        }

                        $scope.domainList = domainList;

                        if($scope.tableConfig.currentPage > 0 && domainList.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('AD_NETWORK_MODULE.DELETE_BLOCK_LIST_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: $translate.instant('AD_NETWORK_MODULE.DELETE_BLOCK_LIST_FAIL')
                        });
                    }
                )
                    ;
            });
        }

        function showPagination() {
            return angular.isArray($scope.domainList) && $scope.domainList.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();