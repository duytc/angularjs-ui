(function () {
    'use strict';

    angular.module('tagcade.videoManagement.demandAdTag')
        .controller('DemandAdTagForm', DemandAdTagForm)
    ;

    function DemandAdTagForm($scope, $q, _, $modal, $stateParams, $translate, demandAdTag, whiteList, blackList, ReplaceMacros, demandPartners, publishers, AlertService, NumberConvertUtil, VideoDemandAdTagManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST, PLATFORM_OPTION, PLAYER_SIZE_OPTIONS, REQUIRED_MACROS_OPTIONS) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = demandAdTag === null;
        $scope.formProcessing = false;

        $scope.publishers = publishers;
        $scope.demandPartners = demandPartners;
        $scope.countries = COUNTRY_LIST;
        $scope.playerSizeOptions = PLAYER_SIZE_OPTIONS;
        $scope.requiredMacrosOptions = REQUIRED_MACROS_OPTIONS;

        $scope.whiteList = whiteList;
        $scope.blackList = blackList;

        $scope.platformOption = [];
        if (!$scope.isNew) {
            angular.forEach(demandAdTag.videoWaterfallTagItem.videoWaterfallTag.platform, function (platformItem) {
                var platform = _.find(PLATFORM_OPTION, function (value) {
                    return platformItem == value.key
                });

                $scope.platformOption.push(platform);
            });

            demandAdTag.activeClone = demandAdTag.active > 0;

            if (demandAdTag.libraryVideoDemandAdTag.linkedCount > 1) {
                AlertService.addAlertNotRemove({
                    type: 'warning',
                    message: $translate.instant('AD_SOURCE_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
                });
            }
        }

        $scope.demandAdTag = demandAdTag || {
            libraryVideoDemandAdTag: {
                name: null,
                videoDemandPartner: null,
                timeout: null,
                tagURL: null,
                sellPrice: null,
                targeting: {
                    countries: [],
                    exclude_countries: [],
                    domains: [],
                    exclude_domains: [],
                    platform: [],
                    player_size: [],
                    required_macros: []
                }
            },
            priority: null,
            activeClone: true,
            rotationWeight: null,
            requestCap: null
        };

        $scope.selectedData = {
            publisher: !$scope.isNew ? $scope.demandAdTag.libraryVideoDemandAdTag.videoDemandPartner.publisher : null
        };

        if (!$scope.isNew) {
            $scope.demandAdTag.libraryVideoDemandAdTag.sellPrice = NumberConvertUtil.convertPriceToString($scope.demandAdTag.libraryVideoDemandAdTag.sellPrice);

            if ($scope.demandAdTag.targetingOverride) {
                $scope.demandAdTag.libraryVideoDemandAdTag.targeting = $scope.demandAdTag.targeting;
            }
        }

        $scope.backToListDemandAdTag = backToListDemandAdTag;
        $scope.selectVideoDemandPartner = selectVideoDemandPartner;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.addDomain = addDomain;
        $scope.createVideoDemandPartner = createVideoDemandPartner;
        $scope.filterExcludeCountriesSelected = filterExcludeCountriesSelected;
        $scope.filterCountriesSelected = filterCountriesSelected;
        $scope.createQuicklyBlackLink = createQuicklyBlackLink;
        $scope.createQuicklyWhiteLink = createQuicklyWhiteLink;
        $scope.viewQuicklyWhiteLink = viewQuicklyWhiteLink;
        $scope.viewQuicklyBlackLink = viewQuicklyBlackLink;
        $scope.replaceMacros = replaceMacros;
        $scope.groupEntities = groupEntities;

        function groupEntities(item){
            if (item.line) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        var isChangeTagURLValue = false;
        $scope.isChangeTagURL = isChangeTagURL;

        function isChangeTagURL() {
            isChangeTagURLValue = true;
        }

        function replaceMacros() {

            if (false == isChangeTagURLValue) {
                return;
            }

            $scope.demandAdTag.libraryVideoDemandAdTag.tagURL = _replaceSpaceByUTF8Code($scope.demandAdTag.libraryVideoDemandAdTag.tagURL);

            ReplaceMacros.replaceVideoMacros($scope.demandAdTag.libraryVideoDemandAdTag.tagURL)
                .then(function () {
                    $scope.demandAdTag.libraryVideoDemandAdTag.tagURL = ReplaceMacros.getVideoUrl();
                });

            isChangeTagURLValue = false;
        }

        function _replaceSpaceByUTF8Code(inputString) {
            if (null != inputString) {
                return inputString.replace(/\s/g, "%20");
            }
        }

        function createQuicklyWhiteLink() {
            var newDomain = {
                name: null,
                domains: []
            };

            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/domainList/domainListQuicklyForm.tpl.html',
                controller: 'DomainListQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function (adminUserManager) {
                        if ($scope.isAdmin() && !publishers) {
                            return adminUserManager.getList({filter: 'publisher'}).then(function (users) {
                                return users.plain();
                            });
                        }

                        return publishers;
                    },
                    publisher: function () {
                        return $scope.selectedData.publisher
                    },
                    blackList: function () {
                        return false;
                    },
                    domain: function () {
                        return newDomain
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.whiteList.push(newDomain);
                //$scope.demandAdTag.targeting.domains.push(newDomain);
            })
        }

        function createQuicklyBlackLink() {
            var newDomain = {
                name: null,
                domains: []
            };

            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/domainList/domainListQuicklyForm.tpl.html',
                controller: 'DomainListQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function (adminUserManager) {
                        if ($scope.isAdmin() && !publishers) {
                            return adminUserManager.getList({filter: 'publisher'}).then(function (users) {
                                return users.plain();
                            });
                        }

                        return publishers;
                    },
                    publisher: function () {
                        return $scope.selectedData.publisher
                    },
                    blackList: function () {
                        return true;
                    },
                    domain: function () {
                        return newDomain
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.blackList.push(newDomain);
                //$scope.demandAdTag.targeting.exclude_domains.push(newDomain);
            })
        }

        function viewQuicklyBlackLink() {
            $modal.open({
                templateUrl: 'videoManagement/domainList/viewQuicklyDomainList.tpl.html',
                controller: 'ViewQuicklyDomainList',
                size: 'lg',
                resolve: {
                    isBlackList: function () {
                        return true;
                    },
                    domainList: function () {
                        return $scope.blackList
                    }
                }
            });
        }

        function viewQuicklyWhiteLink() {
            $modal.open({
                templateUrl: 'videoManagement/domainList/viewQuicklyDomainList.tpl.html',
                controller: 'ViewQuicklyDomainList',
                size: 'lg',
                resolve: {
                    isBlackList: function () {
                        return false;
                    },
                    domainList: function () {
                        return $scope.whiteList
                    }
                }
            });
        }

        function backToListDemandAdTag() {
            if (!!$stateParams.allDemand) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.allVideoDemandAdTag, '^.list');
            }

            if (!!$stateParams.libraryDemandAdTagId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoDemandAdTag, '^.listByLibrary');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.libraryDemandAdTag, '^.^.^.videoLibrary.demandAdTag.listByDemandPartner');
        }

        function selectVideoDemandPartner(videoDemandPartner) {
            $scope.demandAdTag.libraryVideoDemandAdTag.name = videoDemandPartner.name;
        }

        function selectPublisher(publisher) {
            $scope.demandAdTag.libraryVideoDemandAdTag.videoDemandPartner = null
        }

        function addDomain(query) {
            return query;
        }

        function filterExcludeCountriesSelected(country) {
            return $scope.demandAdTag.libraryVideoDemandAdTag.targeting.exclude_countries.indexOf(country.code) == -1
        }

        function filterCountriesSelected(country) {
            return $scope.demandAdTag.libraryVideoDemandAdTag.targeting.countries.indexOf(country.code) == -1
        }

        function createVideoDemandPartner() {
            var demandPartners = [];

            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/demandPartner/videoDemandPartnerQuicklyForm.tpl.html',
                controller: 'VideoDemandPartnerQuicklyForm',
                size: 'lg',
                resolve: {
                    demandPartners: function () {
                        return demandPartners
                    },
                    publishers: function () {
                        return publishers;
                    },
                    publisher: function () {
                        return $scope.selectedData.publisher
                    }
                }
            });

            modalInstance.result.then(function () {
                if (angular.isObject(demandPartners[0])) {
                    var videoDemandPartner = demandPartners[0];
                    $scope.demandPartners.push(videoDemandPartner);
                    $scope.demandAdTag.libraryVideoDemandAdTag.videoDemandPartner = videoDemandPartner.id;

                    $scope.demandAdTag.libraryVideoDemandAdTag.name = videoDemandPartner.name;
                }
            })
        }

        function isFormValid() {
            return $scope.demandAdTagForm.$valid;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            var dfd = $q.defer();

            dfd.promise.then(function () {
                $scope.formProcessing = true;

                var demandAdTag = angular.copy($scope.demandAdTag);
                demandAdTag.libraryVideoDemandAdTag.sellPrice = NumberConvertUtil.convertPriceToString(demandAdTag.libraryVideoDemandAdTag.sellPrice);
                delete demandAdTag.libraryVideoDemandAdTag.id;
                delete demandAdTag.libraryVideoDemandAdTag.linkedCount;
                delete demandAdTag.profit;
                if (typeof demandAdTag.activeClone != 'number') {
                    demandAdTag.active = demandAdTag.activeClone ? 1 : 0
                }
                delete demandAdTag.activeClone;
                demandAdTag.libraryVideoDemandAdTag.videoDemandPartner = $scope.demandAdTag.libraryVideoDemandAdTag.videoDemandPartner.id || $scope.demandAdTag.libraryVideoDemandAdTag.videoDemandPartner;

                if (demandAdTag.targetingOverride) {
                    demandAdTag.targeting = demandAdTag.libraryVideoDemandAdTag.targeting;
                    // targeting root
                    delete demandAdTag.libraryVideoDemandAdTag.targeting;
                } else {
                    if (!$scope.isNew && demandAdTag.libraryVideoDemandAdTag.linkedCount > 1) {
                        delete demandAdTag.libraryVideoDemandAdTag.targeting;
                    }
                }

                var saveDemandAdTag = $scope.isNew ? VideoDemandAdTagManager.post(demandAdTag) : VideoDemandAdTagManager.one($scope.demandAdTag.id).patch(demandAdTag);

                saveDemandAdTag
                    .catch(
                    function (response) {
                        if (!response.data.errors) {
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: response.data.message
                            });

                            $scope.formProcessing = false;

                            return $q.reject();
                        }

                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.demandAdTagForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    })
                    .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? $translate.instant('AD_SOURCE_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_SOURCE_MODULE.UPDATE_SUCCESS')
                        });
                    })
                    .then(
                    function () {
                        return backToListDemandAdTag();
                    }
                )
                ;
            });

            if (!$scope.isNew
                && $scope.demandAdTag.videoWaterfallTagItem.videoWaterfallTag.buyPrice != null
                && $scope.demandAdTag.libraryVideoDemandAdTag.sellPrice != null
                && $scope.demandAdTag.videoWaterfallTagItem.videoWaterfallTag.buyPrice > $scope.demandAdTag.libraryVideoDemandAdTag.sellPrice
            ) {
                var modalInstance = $modal.open({
                    templateUrl: 'videoManagement/demandAdTag/confirmSubmit.tpl.html'
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        }
    }
})();