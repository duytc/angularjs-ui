(function() {
    'use strict';

    angular.module('tagcade.tagManagement.domainList')
        .controller('ViewDomains', ViewDomains)
    ;

    function ViewDomains($scope, $timeout, $modal, domain, whiteList) {
        $scope.domains = [];
        $scope.domain = domain;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 7
        };

        angular.forEach($scope.domain.domains, function(domain) {
            $scope.domains.push({
                name: domain
            })
        });

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '50', key: '50'},
            {label: '100', key: '100'},
            {label: '200', key: '200'}
        ];

        $scope.showPagination = function() {
            return angular.isArray($scope.domains) && $scope.domains.length > $scope.tableConfig.itemsPerPage;
        };

        $scope.addDomains = function () {
            var newParams = {
                domains: []
            };

            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adNetwork/domainList/addDomains.tpl.html',
                controller: function ($scope, $modalInstance, AlertService, DOMAINS_LIST_SEPARATOR, newParams, domain, whiteList, DisplayBlackListManager, DisplayWhiteListManager) {
                    $scope.domain = domain;
                    $scope.selected = {
                        domains: []
                    };

                    $scope.isFormValid = function() {
                        return $scope.addDomains.$valid;
                    };

                    $scope.addDomain = addDomain;
                    $scope.submit = submit;
                    
                    function submit() {
                        var domainClone = angular.copy($scope.domain);

                        domainClone.domains = domainClone.domains.concat($scope.selected.domains);

                        var Manager = whiteList ? DisplayWhiteListManager : DisplayBlackListManager;

                        Manager.one(domainClone.id).patch({domains: domainClone.domains})
                            .catch(function() {
                                AlertService.replaceAlerts({
                                    type: 'error',
                                    message: 'The domains could not be added'
                                });
                            })
                            .then(function () {
                                angular.extend(newParams.domains, $scope.selected.domains);

                                AlertService.replaceAlerts({
                                    type: 'success',
                                    message: 'The domains has been added'
                                });
                            })
                            .then(function () {
                                $modalInstance.close();
                            });
                    }

                    function addDomain(query) {
                        var hasSeparator = false;

                        angular.forEach(DOMAINS_LIST_SEPARATOR, function(key) {
                            if(query.indexOf(key) > -1 && !hasSeparator) {
                                hasSeparator = true;
                                var domains = query.split(key);

                                angular.forEach(domains, function(item, index) {
                                    item = item.toLowerCase();

                                    if(!/^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(item)) {
                                        return
                                    }

                                    if($scope.selected.domains.indexOf(item) > -1 || $scope.domain.domains.indexOf(item) > -1) {
                                        return
                                    }

                                    $scope.selected.domains.push(item);
                                });
                            }
                        });

                        if(hasSeparator) {
                            return '';
                        }

                        if(!/^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(query)) {
                            return
                        }

                        if($scope.selected.domains.indexOf(query.toLowerCase()) > -1 || $scope.domain.domains.indexOf(query.toLowerCase()) > -1) {
                            return
                        }

                        return query.toLowerCase();
                    }
                },
                size: 'lg',
                resolve: {
                    domain: function(){
                        return $scope.domain;
                    },
                    whiteList: function () {
                        return whiteList
                    },
                    newParams: function () {
                        return newParams
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.domain.domains = $scope.domain.domains.concat(newParams.domains);

                $timeout(function () {
                    angular.forEach(newParams.domains, function(domain) {
                        $scope.domains.push({
                            name: domain
                        })
                    })
                }, 0, true);
            })
        };
    }
})();