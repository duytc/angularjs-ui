(function() {
    'use strict';

    angular.module('tagcade.tagManagement.domainList')
        .controller('ViewDomains', ViewDomains)
    ;

    function ViewDomains($scope, $filter, DisplayBlackListManager, DisplayWhiteListManager, domain, whiteList, DOMAINS_LIST_SEPARATOR) {
        $scope.domain = domain;
        $scope.domains = $scope.domain.domains;

        $scope.alerts = [];

        $scope.selected = {
            addDomains: false,
            domains: []
        };

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 7
        };

        $scope.query = null;

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '50', key: '50'},
            {label: '100', key: '100'},
            {label: '200', key: '200'}
        ];

        $scope.search = search;

        function search() {
            if(!!$scope.query) {
                $scope.domains = $filter("filter")($scope.domain.domains, $scope.query);
            } else {
                $scope.domains = $scope.domain.domains
            }
        }

        $scope.showPagination = function() {
            return angular.isArray($scope.domains) && $scope.domains.length > $scope.tableConfig.itemsPerPage;
        };

        $scope.isFormValid = function() {
            return _.without($scope.selected.domains, null, undefined, '').length > 0;
        };

        $scope.submit = function () {
            var domainClone = angular.copy($scope.domain);

            $scope.selected.domains = _.without($scope.selected.domains, null, undefined, '');

            domainClone.domains = domainClone.domains.concat($scope.selected.domains);

            var Manager = whiteList ? DisplayWhiteListManager : DisplayBlackListManager;

            Manager.one(domainClone.id).patch({domains: domainClone.domains})
                .catch(function() {
                    $scope.alerts = [];
                    $scope.alerts.push({ type: 'danger', msg: 'The domains could not be added' });
                })
                .then(function () {
                    $scope.domain.domains = $scope.domain.domains.concat($scope.selected.domains);
                    $scope.domains = $scope.domain.domains;
                    search();

                    $scope.alerts = [];
                    $scope.alerts.push({ type: 'success', msg: 'The domains have been added' });
                })
                .then(function () {
                    $scope.selected.domains = [];
                });
        };

        $scope.addDomain =  function (query) {
            var hasSeparator = false;

            angular.forEach(DOMAINS_LIST_SEPARATOR, function(key) {
                if(query.indexOf(key) > -1 && !hasSeparator) {
                    hasSeparator = true;
                    var domains = query.split(key);

                    angular.forEach(domains, function(item, index) {
                        item = item.toLowerCase();

                        // validate domain
                        // support wildcard domain such as "*.sub-2.sub-1.mydomain.com"
                        if(!/^(?:[\*]?\.)?(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(item)) {
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

            if(!/^(?:[\*]?\.)?(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(query)) {
                return
            }

            if($scope.selected.domains.indexOf(query.toLowerCase()) > -1 || $scope.domain.domains.indexOf(query.toLowerCase()) > -1) {
                return
            }

            return query.toLowerCase();
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        
        $scope.deleteDomain = function (domain) {
            var domainClone = angular.copy($scope.domain);
            domainClone.domains = _.without(domainClone.domains, null, undefined, '', domain);

            var Manager = whiteList ? DisplayWhiteListManager : DisplayBlackListManager;

            Manager.one(domainClone.id).patch({domains: domainClone.domains})
                .catch(function() {
                    $scope.alerts = [];
                    $scope.alerts.push({ type: 'danger', msg: 'The domains could not be deleted' });
                })
                .then(function () {
                    if($scope.domain.domains.indexOf(domain) > -1) {
                        $scope.domain.domains.splice($scope.domain.domains.indexOf(domain), 1);
                    }

                    $scope.domains = $scope.domain.domains;
                    search();

                    if($scope.tableConfig.currentPage > 0 && $scope.domains.length/10 == $scope.tableConfig.currentPage) {
                        $scope.tableConfig.currentPage -= 1
                    }

                    $scope.alerts = [];
                    $scope.alerts.push({ type: 'success', msg: 'The domains have been deleted' });
                });
        }
    }
})();