(function() {
    'use strict';

    angular.module('tagcade.videoLibrary.demandAdTag')
        .controller('LibraryDemandAdTagForm', LibraryDemandAdTagForm)
    ;

    function LibraryDemandAdTagForm($scope, $q, _, $filter, $stateParams, $modal, $translate, UISelectMethod, videoPublishers, waterfallTags, whiteList, blackList, demandPartner, demandAdTag, demandPartners, publishers, AlertService, NumberConvertUtil, ReplaceMacros, LibraryDemandAdTagManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST, PLATFORM_OPTION, PLAYER_SIZE_OPTIONS, REQUIRED_MACROS_OPTIONS) {
        var isChangeTagURLValue = false;

        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.profiltValueLabel = 'Profit Value';
        $scope.ruleTypes = [
            {key: 1, value: "Fixed Profit"},
            {key: 2, value: "Profit Margin"},
            {key: 3, value: "Manual"}
        ];



        $scope.whiteList = whiteList;
        $scope.blackList = blackList;
        $scope.demandPartner = demandPartner;
        $scope.countries = COUNTRY_LIST;
        $scope.platformOption = PLATFORM_OPTION;
        $scope.playerSizeOptions = PLAYER_SIZE_OPTIONS;
        $scope.requiredMacrosOptions = REQUIRED_MACROS_OPTIONS;


        $scope.isNew = demandAdTag === null;
        $scope.formProcessing = false;
        $scope.publishers = publishers;
        $scope.videoPublishers = UISelectMethod.addAllOption(videoPublishers, 'All Publishers');
        //$scope.waterfallTags = $scope.isAdmin() ? [] : waterfallTags;
        $scope.waterfallTags = waterfallTags;
        $scope.demandPartners = demandPartners;

        var waterfallTagsCopy = angular.copy($scope.waterfallTags);


        if(!$scope.isNew) {
            AlertService.addAlert({
                type: 'warning',
                message: $translate.instant('AD_SOURCE_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
            });
        }

        $scope.demandAdTag = demandAdTag || {
            name: null,
            tagURL: null,
            timeout: 3,
            sellPrice: null,
            videoDemandPartner: demandPartner || null,
            targeting: {
                countries: [],
                exclude_countries: [],
                domains: [],
                exclude_domains: [],
                platform: [],
                player_size: [],
                required_macros: []
            },
            waterfallPlacementRules: []
        };

        $scope.selectedData = {
            publisher: !$scope.isNew ? demandAdTag.videoDemandPartner.publisher : (!!demandPartner ? demandPartner.publisher : null),
            videoPublisher: null,
            isDeployment: false,
            waterfallTags: []
        };

        if(!$scope.isNew) {
            $scope.demandAdTag.sellPrice = NumberConvertUtil.convertPriceToString($scope.demandAdTag.sellPrice);
        }

        $scope.requiredBuyPrice = $scope.demandAdTag.sellPrice;

        if($scope.isNew && !!demandPartner) {
            _filterWaterfallsForPublisher(demandPartner.publisher);
        }

        $scope.backToListDemandAdTag = backToListDemandAdTag;
        $scope.selectVideoDemandPartner = selectVideoDemandPartner;
        $scope.selectVideoPublisher = selectVideoPublisher;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.createVideoDemandPartner = createVideoDemandPartner;
        $scope.filterExcludeCountriesSelected = filterExcludeCountriesSelected;
        $scope.filterCountriesSelected = filterCountriesSelected;
        $scope.createQuicklyWhiteLink = createQuicklyWhiteLink;
        $scope.createQuicklyBlackLink = createQuicklyBlackLink;
        $scope.viewQuicklyWhiteLink = viewQuicklyWhiteLink;
        $scope.viewQuicklyBlackLink = viewQuicklyBlackLink;
        $scope.replaceMacros = replaceMacros;
        $scope.isChangeTagURL = isChangeTagURL;
        $scope.addNewPlacementRule = addNewPlacementRule;
        $scope.removePlacementRule = removePlacementRule;
        $scope.changeProfitValueLabel = changeProfitValueLabel;
        $scope.changeRequireBuyPrice = changeRequireBuyPrice;
        $scope.initRequiredBuyPrice = initRequiredBuyPrice;
        $scope.initProfitValueLabel = initProfitValueLabel;
        $scope.changeWaterfallTags = changeWaterfallTags;
        $scope.removeWaterfallTags = removeWaterfallTags;



        function initRequiredBuyPrice (rule) {

            $scope.requiredBuyPrice = $scope.demandAdTag.sellPrice;

            if (rule.profitType == 1) {
                $scope.requiredBuyPrice = $scope.requiredBuyPrice - rule.profitValue;
            } else if (rule.profitType ==2) {
                $scope.requiredBuyPrice = $scope.requiredBuyPrice - rule.profitValue*$scope.requiredBuyPrice/100;
            } else {
                $scope.requiredBuyPrice = $scope.demandAdTag.sellPrice;
            }
        }


        function initProfitValueLabel(rule) {
            switch (rule.profitType) {
                case 1:
                    $scope.profiltValueLabel = 'Profit Value ($)';
                    break;
                case 2:
                    $scope.profiltValueLabel = 'Profit Value (%)';
                    break;
                default:
                    $scope.profiltValueLabel = 'Profit Value';
                    break;
            }
        }

        function addNewPlacementRule() {
            $scope.demandAdTag.waterfallPlacementRules.push({profitType: 3, profitValue: null, position:null, priority: null, rotationWeight:null, waterfalls: null, publishers: []});
        }

        function removePlacementRule(index) {
            $scope.demandAdTag.waterfallPlacementRules.splice(index, 1);
        }

        function changeProfitValueLabel($item, rule ) {
            switch ($item.key) {
                case 1:
                    $scope.profiltValueLabel = 'Profit Value ($)';
                    break;
                case 2:
                    $scope.profiltValueLabel = 'Profit Value (%)';
                    break;
                default:
                    $scope.profiltValueLabel = 'Profit Value';
                    break;
            }

            rule.profitValue = null;
            $scope.requiredBuyPrice = $scope.demandAdTag.sellPrice;
        }

        function changeRequireBuyPrice(inputValue, inputType) {
            switch (inputType) {
                case 1:
                    var requireBuyPriceByFixProfit = $scope.demandAdTag.sellPrice - inputValue;
                    $scope.requiredBuyPrice = requireBuyPriceByFixProfit > 0 ? requireBuyPriceByFixProfit : 0;
                    console.log('Update:', $scope.requiredBuyPrice);
                    break;
                case 2:
                    var requireBuyPriceByMarginProfit = $scope.demandAdTag.sellPrice - inputValue*$scope.demandAdTag.sellPrice/100;
                    $scope.requiredBuyPrice = requireBuyPriceByMarginProfit > 0 ? requireBuyPriceByMarginProfit : 0;
                    break;
                default:
                    $scope.requiredBuyPrice = $scope.demandAdTag.sellPrice;
                    break;
            }
        }

        var items= [];
        function changeWaterfallTags($selectedItem) {

            items = items.length >0 ?  items : [];
            items.push($selectedItem.id);

            $scope.waterfallTags = _.filter(waterfallTagsCopy , function(waterfallTag){
                return _.contains(items, waterfallTag.videoPublisher.id);
             });

            console.log("Value after filter", $scope.waterfallTags);
        }

        function removeWaterfallTags($selectedItem, rule) {

            items = items.length >0 ?  items : [];
            var indexOfThisItem = items.indexOf($selectedItem.id);
            items.splice(indexOfThisItem, 1);

            $scope.waterfallTags = _.filter(waterfallTagsCopy , function(waterfallTag){
                return _.contains(items, waterfallTag.videoPublisher.id);
            });

            if($scope.waterfallTags.length == 0) {
                $scope.waterfallTags = waterfallTagsCopy;
            }

            rule.waterfalls =  [];
        }

        function isChangeTagURL() {
            isChangeTagURLValue = true;
        }

        function replaceMacros() {
            if (false == isChangeTagURLValue) {
                return;
            }

            ReplaceMacros.replaceVideoMacros($scope.demandAdTag.tagURL)
                .then(function () {
                    $scope.demandAdTag.tagURL = ReplaceMacros.getVideoUrl();
                });

            isChangeTagURLValue = false;
        }

        function selectVideoPublisher(videoPublisher) {
            $scope.selectedData.waterfallTags = [];

            $scope.waterfallTags = $filter('filter')(waterfallTags, function(waterfall) {
                if(videoPublisher.id == null) {
                    return true;
                }

                if(waterfall.videoPublisher.id == videoPublisher.id) {
                    return true;
                }

                return false
            })
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
                    publishers: function(){
                        return publishers;
                    },
                    publisher: function() {
                        return $scope.selectedData.publisher
                    },
                    blackList: function() {
                        return false;
                    },
                    domain: function() {
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
                    publishers: function(){
                        return publishers;
                    },
                    publisher: function() {
                        return $scope.selectedData.publisher
                    },
                    blackList: function() {
                        return true;
                    },
                    domain: function() {
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
                    isBlackList: function() {
                        return true;
                    },
                    domainList: function() {
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
                    isBlackList: function() {
                        return false;
                    },
                    domainList: function() {
                        return $scope.whiteList;
                    }
                }
            });
        }

        function backToListDemandAdTag() {
            if(!!$stateParams.demandPartnerId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.libraryDemandAdTag, '^.listByDemandPartner');
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.libraryDemandAdTag, '^.list');
        }

        function selectVideoDemandPartner(videoDemandPartner) {
            $scope.demandAdTag.name = videoDemandPartner.name;
        }

        function selectPublisher(publisher) {
            $scope.selectedData.videoPublisher = null;
            $scope.selectedData.waterfallTags = [];
            $scope.demandAdTag.videoDemandPartner = null;

            _filterWaterfallsForPublisher(publisher);
        }

        function filterExcludeCountriesSelected(country) {
            return $scope.demandAdTag.targeting.exclude_countries.indexOf(country.code) == -1
        }

        function filterCountriesSelected(country) {
            return $scope.demandAdTag.targeting.countries.indexOf(country.code) == -1
        }

        function createVideoDemandPartner() {
            var demandPartners = [];

            var modalInstance = $modal.open({
                templateUrl: 'videoManagement/demandPartner/videoDemandPartnerQuicklyForm.tpl.html',
                controller: 'VideoDemandPartnerQuicklyForm',
                size: 'lg',
                resolve: {
                    demandPartners: function() {
                        return demandPartners
                    },
                    publishers: function(){
                        return publishers;
                    },
                    publisher: function() {
                        return $scope.selectedData.publisher
                    }
                }
            });

            modalInstance.result.then(function () {
                if(angular.isObject(demandPartners[0])) {
                    var videoDemandPartner = demandPartners[0];
                    $scope.demandPartners.push(videoDemandPartner);
                    $scope.demandAdTag.videoDemandPartner = videoDemandPartner.id;

                    $scope.demandAdTag.name = videoDemandPartner.name;
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

                var demandAdTag = _refactorJson();

                var saveDemandAdTag = $scope.isNew ? LibraryDemandAdTagManager.post(demandAdTag) : LibraryDemandAdTagManager.one(demandAdTag.id).patch(demandAdTag);

                saveDemandAdTag
                    .catch(
                    function (response) {
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

            if (_confirmSubmitForPlatform()) {
                $modal.open({
                    templateUrl: 'videoLibrary/demandAdTag/confirmSubmitPlatform.tpl.html'
                });
            } else if (_confirmSubmitForPrice()) {
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

        function _confirmSubmitForPrice() {
            var confirmSubmit = false;

            angular.forEach($scope.selectedData.waterfallTags, function(waterfall) {
                if(confirmSubmit) {
                    return
                }

                if($scope.demandAdTag.sellPrice == null || waterfall.buyPrice == null) {
                    return confirmSubmit = false;
                }

                if(waterfall.buyPrice > $scope.demandAdTag.sellPrice) {
                    return confirmSubmit = true;
                }
            });

            return confirmSubmit;
        }

        function _confirmSubmitForPlatform() {
            var confirm = false;

            if($scope.demandAdTag.targeting.platform.length > 0) {
                angular.forEach($scope.selectedData.waterfallTags, function(waterfallTag) {
                    if(confirm) {
                        return
                    }

                    if(waterfallTag.platform.length < $scope.demandAdTag.targeting.platform.length) {
                        return confirm = true;
                    }

                    if(_.intersection(waterfallTag.platform, $scope.demandAdTag.targeting.platform).length == 0) {
                        return confirm = true;
                    }
                });
            }

            return confirm;
        }

        function _refactorJson() {
            var demandAdTag = angular.copy($scope.demandAdTag);
            var domains = [], excludeDomains = [];

            if(!!demandAdTag.sellPrice) {
                demandAdTag.sellPrice = NumberConvertUtil.convertPriceToString(demandAdTag.sellPrice);
            }

            angular.forEach(demandAdTag.targeting.domains, function(item) {
                if(!!item.suffixKey) {
                    domains.push(item.suffixKey);
                }
            });

            angular.forEach(demandAdTag.targeting.exclude_domains, function(item) {
                if(!!item.suffixKey) {
                    excludeDomains.push(item.suffixKey);
                }
            });

            demandAdTag.targeting.domains = domains;
            demandAdTag.targeting.exclude_domains = excludeDomains;

            if($scope.selectedData.isDeployment && $scope.selectedData.waterfallTags.length > 0) {
                var waterfallTags = [];

                angular.forEach($scope.selectedData.waterfallTags, function(waterfallTag) {
                    waterfallTags.push(waterfallTag.id);
                });

                demandAdTag.waterfalls = waterfallTags;
            }

            if(!demandAdTag.sellPrice) {
                demandAdTag.waterfallPlacementRules = [];
            }

            delete demandAdTag.linkedCount;

            return demandAdTag;
        }

        function _filterWaterfallsForPublisher(publisher) {
            $scope.waterfallTags = $filter('filter')(waterfallTags, function(waterfallTag) {
                return waterfallTag.videoPublisher.publisher.id == publisher.id
            });
        }
    }
})();