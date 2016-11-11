(function() {
    'use strict';

    angular.module('tagcade.videoManagement.domainList')
        .controller('ViewQuicklyDomainList', ViewQuicklyDomainList)
    ;

    function ViewQuicklyDomainList($scope, Auth, $translate, $modal, AlertService, isBlackList, domainList, WhiteListManager, BlackListManager, AtSortableService) {
        $scope.isBlackList  = isBlackList;
        $scope.domainList = domainList;
        $scope.isAdmin = Auth.isAdmin();

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };


        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.editQuicklyWhiteLink = editQuicklyWhiteLink;
        $scope.editQuicklyBlackLink = editQuicklyBlackLink;
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

        function editQuicklyBlackLink(domain) {
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
                        return true;
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
                templateUrl: 'videoManagement/domainList/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                var removeManager = isBlackList ? BlackListManager.one(domain.id) : WhiteListManager.one(domain.id);
                return removeManager.remove()
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
                            message: isBlackList ? $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.DELETE_WHITE_LIST_SUCCESS')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message:  isBlackList ? $translate.instant('DOMAIN_LIST_MODULE.DELETE_BLACK_LIST_FAIL') : $translate.instant('DOMAIN_LIST_MODULE.DELETE_WHITE_LIST_FAIL')
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