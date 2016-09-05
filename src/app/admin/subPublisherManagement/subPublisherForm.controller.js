(function () {
    'use strict';

    angular
        .module('tagcade.admin.subPublisher')
        .controller('SubPublisherForm', SubPublisherForm)
    ;

    function SubPublisherForm($scope, $filter, $modal, $translate, _, partners, subPublisherRestangular, AlertService, sites, ServerErrorProcessor, SiteManager, publishers, subPublisher, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            username: 'Username',
            plainPassword: 'Password',
            company: 'Company'
        };

        $scope.isNew = subPublisher === null;

        // merge site list of subpublisher and list site not belong publisher when edit
        if(!$scope.isNew) {
            angular.forEach(subPublisher.sites, function(site) {
                var idx = _.findIndex(sites, function(si) {
                    return si.id == site.id;
                });

                if(idx == -1) {
                    sites.push(site)
                }
            })
        }

        $scope.formProcessing = false;
        $scope.countries = COUNTRY_LIST;

        $scope.sites = !$scope.isAdmin() ? sites : [];
        $scope.publishers = publishers;
        $scope.partners = [];
        $scope.siteData = [];

        $scope.revenueOption = {
            none: 0,
            fixedRate: 1,
            percentage: 2
        };

        $scope.subPublisher = subPublisher || {
            username: null,
            email: null,
            sites: [],
            subPublisherPartnerRevenue: [],
            demandSourceTransparency: false,
            enabled: true
        };


        if(!$scope.isNew) {
            // todo filter for admin
            //$scope.sites = $filter('selectedPublisher')(sites, subPublisher.publisher);

            angular.forEach($scope.subPublisher.sites, function(site) {
                var index = _.findLastIndex(sites, {id: site.id});
                if(index >= 0) {
                    sites[index]['ticked'] = true;
                    $scope.siteData.push(sites[index]);
                }
            });
        }

        // convert input partners
        angular.forEach(partners, function(partner) {
            var partnerInSubPublisher = _.find($scope.subPublisher.subPublisherPartnerRevenue, function(subPublisherPartner) {
                return subPublisherPartner.adNetworkPartner.id == partner.id;
            });

            if(!!partnerInSubPublisher) {
                $scope.partners.push({adNetworkPartner: partner.id, revenueOption: partnerInSubPublisher.revenueOption, revenueValue: !partnerInSubPublisher.revenueOption ? null : partnerInSubPublisher.revenueValue, active: true, name: partner.name})
            } else {
                $scope.partners.push({adNetworkPartner: partner.id, revenueOption: $scope.revenueOption.none, revenueValue: null, active: false, name: partner.name})
            }
        });

        $scope.isFormValid = function() {
            if($scope.subPublisher.plainPassword != null || $scope.repeatPassword != null) {
                return $scope.userForm.$valid && $scope.repeatPassword == $scope.subPublisher.plainPassword;
            }

            return $scope.userForm.$valid;
        };

        $scope.backToListPublisher = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.subPublisher, '^.list');
        };

        $scope.selectPublisher = function(publisher) {
            $scope.sites = $filter('selectedPublisher')(sites, publisher);

            $scope.siteData = [];
        };

        $scope.createSite = function() {
            var modalInstance = $modal.open({
                templateUrl: 'admin/subPublisherManagement/siteQuicklyForm.tpl.html',
                controller: 'SiteQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function(){
                        return publishers;
                    },
                    channels: /* @ngInject */ function(ChannelManager) {
                        return ChannelManager.getList();
                    }
                }
            });

            modalInstance.result.then(function () {
                SiteManager.one('notBelongToSubPublisher').getList()
                    .then(function(sites) {
                        $scope.sites = $filter('selectedPublisher')(sites, $scope.subPublisher.publisher);

                        // find site new to select quickly
                        var siteNew = _.max($scope.sites, function(site){ return site.id; });
                        var indexNew = _.findLastIndex($scope.sites, {id: siteNew.id});
                        $scope.sites[indexNew]['ticked'] = true;

                        // set ticked is true for site have been choose
                        angular.forEach($scope.siteData, function(site) {
                            var index = _.findLastIndex($scope.sites, {id: site.id});
                            if(index >= 0) {
                                $scope.sites[index]['ticked'] = true;
                            } else {
                                $scope.sites.push(site);
                            }
                        });
                    });
            })
        };

        $scope.checkDemandSourceTransparency = function() {
            if($scope.subPublisher.demandSourceTransparency) {
                var modalInstance = $modal.open({
                    templateUrl: 'admin/subPublisherManagement/confirmDemandSourceTransparency.tpl.html'
                });

                modalInstance.result.catch(function () {
                    $scope.subPublisher.demandSourceTransparency = false;
                })
            }
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            delete $scope.subPublisher.enabledModules;
            delete $scope.subPublisher.lastLogin;

            $scope.subPublisher.subPublisherPartnerRevenue = refactorJson($scope.partners);

            if(!$scope.isAdmin()) {
                delete $scope.subPublisher.publisher;
            }

            $scope.subPublisher.sites = [];
            angular.forEach($scope.siteData, function(site) {
                $scope.subPublisher.sites.push(site.id);
            });

            var saveUser = $scope.isNew ? subPublisherRestangular.one('subpublishers').post(null, $scope.subPublisher) : subPublisherRestangular.one('subpublishers', $scope.subPublisher.id).patch($scope.subPublisher);

            saveUser
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? $translate.instant('PUBLISHER_MODULE.ADD_NEW_SUCCESS') : $translate.instant('PUBLISHER_MODULE.UPDATE_SUCCESS')
                        });
                    }
                )
                .then(
                    function () {
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.subPublisher, '^.list');
                    }
                )
            ;
        };

        function refactorJson(partners) {
            var subPublisherPartnerRevenue = [];
            partners = angular.copy(partners);

            angular.forEach(partners, function(partner) {
                if(partner.active) {
                    delete partner.active;
                    delete partner.name;

                    if(partner.revenueOption == 0) {
                        delete partner.revenueValue
                    }

                    subPublisherPartnerRevenue.push(partner);
                }
            });

            return subPublisherPartnerRevenue;
        }
    }
})();