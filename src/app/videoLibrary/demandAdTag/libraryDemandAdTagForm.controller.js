(function() {
    'use strict';

    angular.module('tagcade.videoLibrary.demandAdTag')
        .controller('LibraryDemandAdTagForm', LibraryDemandAdTagForm);

    function LibraryDemandAdTagForm($scope, $q, _, $filter, $stateParams, $modal, $translate, videoPublishers, waterfallTags, whiteList, blackList, demandPartner, demandAdTag, demandPartners, publishers, AlertService, NumberConvertUtil, ReplaceMacros, LibraryDemandAdTagManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST, PLATFORM_OPTION, PLAYER_SIZE_OPTIONS, REQUIRED_MACROS_OPTIONS) {
        var isChangeTagURLValue = false;

        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.profiltValueLabel = 'Profit Value';
        $scope.ruleTypes = [{
            key: 1,
            value: "Fixed Profit"
        }, {
            key: 2,
            value: "Profit Margin"
        }, {
            key: 3,
            value: "Manual"
        }];

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
        $scope.videoPublishers = videoPublishers;
        //$scope.waterfallTags = $scope.isAdmin() ? [] : waterfallTags;
        $scope.waterfallTags = waterfallTags;
        $scope.demandPartners = demandPartners;
        $scope.clearInputSearchValue  = clearInputSearchValue;

        if (!$scope.isNew) {
            AlertService.addAlertNotRemove({
                type: 'warning',
                message: $translate.instant('AD_SOURCE_LIBRARY_MODULE.WARNING_EDIT_LIBRARY')
            });
        }

        $scope.demandAdTag = setTicketForVideoPublisherAndWaterfallTagInDemandAdTags(demandAdTag, videoPublishers, waterfallTags) || {
            name: null,
            tagURL: null,
            timeout: null,
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

        function clearInputSearchValue ($searchValue)
        {
            setTimeout(function(){
                $searchValue = null;
            }, 0)
        }

        function setTicketForVideoPublisherAndWaterfallTagInDemandAdTags(demandAdTag, videoPublishers, waterfallTags) {
            var videoPublisherIds = [],
                waterfallTagIds = [];
            var videoPublisherObjectInDemandAdTag = [],
                waterfallTagsInDemandAdTag = [];

            if (demandAdTag == null) {
                return;
            }

            $scope.waterfallTags = _.filter(angular.copy(waterfallTags), function(waterfallTag) {
                return demandAdTag.videoDemandPartner.publisher.id == waterfallTag.videoPublisher.publisher.id
            });

            angular.forEach(demandAdTag.waterfallPlacementRules, function(waterfallPlacementRule) {
                videoPublisherIds = waterfallPlacementRule.publishers;
                waterfallTagIds = waterfallPlacementRule.waterfalls;

                waterfallPlacementRule['videoPublishers'] = _.filter(angular.copy(videoPublishers), function(videoPublisher) {
                    return videoPublisher.publisher.id == demandAdTag.videoDemandPartner.publisher.id;
                });

                waterfallPlacementRule['waterfallTags'] = _.filter(angular.copy(waterfallTags), function(waterfallTag) {
                    return _.contains(videoPublisherIds, waterfallTag.videoPublisher.id);
                });

                videoPublisherObjectInDemandAdTag = _.filter(waterfallPlacementRule['videoPublishers'], function(videoPublisher) {
                    return _.contains(videoPublisherIds, videoPublisher.id);
                });

                waterfallTagsInDemandAdTag = _.filter(waterfallPlacementRule['waterfallTags'], function(waterfallTag) {
                    return _.contains(waterfallTagIds, waterfallTag.id);
                });

                angular.forEach(videoPublisherObjectInDemandAdTag, function(videoPublisherObject) {
                    videoPublisherObject['ticked'] = true;
                });

                angular.forEach($scope.videoPublishers, function(videoPublisher) {
                    if(_.contains(videoPublisherIds, videoPublisher.id)) {
                        videoPublisher['ticked'] = true;
                    }
                });

                angular.forEach(waterfallTagsInDemandAdTag, function(waterfallTag) {
                    waterfallTag['ticked'] = true;
                });

                waterfallPlacementRule.publishers = videoPublisherObjectInDemandAdTag;
                waterfallPlacementRule.waterfalls = waterfallTagsInDemandAdTag;
                waterfallPlacementRule.profitValue = NumberConvertUtil.convertPriceToString(waterfallPlacementRule.profitValue);
                changeRequireBuyPrice(waterfallPlacementRule, demandAdTag.sellPrice);
            });

            return demandAdTag;
        }

        $scope.selectedData = {
            publisher: !$scope.isNew ? demandAdTag.videoDemandPartner.publisher : (!!demandPartner ? demandPartner.publisher : null),
            videoPublisher: null,
            isDeployment: false,
            waterfallTags: []
        };

        if (!$scope.isNew) {
            $scope.demandAdTag.sellPrice = NumberConvertUtil.convertPriceToString($scope.demandAdTag.sellPrice);
        }

        $scope.localLang = {
            selectAll: "Select All",
            selectNone: "Select None",
            reset: "Reset",
            search: "Type here to search...",
            nothingSelected: "None Selected"
        };

        $scope.backToListDemandAdTag = backToListDemandAdTag;
        $scope.selectVideoDemandPartner = selectVideoDemandPartner;
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
        $scope.initProfitValueLabel = initProfitValueLabel;
        $scope.filterWaterfallTags = filterWaterfallTags;
        $scope.filterWaterfallTagsBySelectAll = filterWaterfallTagsBySelectAll;
        $scope.filterWaterfallBySelectNone = filterWaterfallBySelectNone;
        $scope.updateMaximumRequirePrice = updateMaximumRequirePrice;
        $scope.returnSellPrice = returnSellPrice;
        $scope.groupEntities = groupEntities;
        $scope.clickVIewHelpText = clickVIewHelpText;

        function clickVIewHelpText() {
            $modal.open({
                templateUrl: 'videoManagement/IVTPixel/helpTextMacros.tpl.html',
                controller: function ($scope, REQUIRED_MACROS_OPTIONS) {
                    $scope.macrosOptions = REQUIRED_MACROS_OPTIONS;
                }
            });
        }

        function groupEntities(item){
            if (item.line) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function returnSellPrice(sellPrice) {
            if(sellPrice.indexOf('.') > -1) {
                return '$' + sellPrice;
            } else {
                var num = Number(sellPrice);
                return $filter('currency')(num)
            }
        }

        function updateMaximumRequirePrice() {
            if($scope.demandAdTag.waterfallPlacementRules.length > 0) {
                angular.forEach($scope.demandAdTag.waterfallPlacementRules, function(waterfallPlacementRule) {
                    if(!$scope.demandAdTag.sellPrice) {
                        waterfallPlacementRule.profitType = 3
                    }

                    changeRequireBuyPrice(waterfallPlacementRule);
                });
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
            var videoPublishersFilter = _.filter(angular.copy(videoPublishers), function(videoPublisher) {
                if(!!$scope.selectedData.publisher) {
                    return videoPublisher.publisher.id == $scope.selectedData.publisher || videoPublisher.publisher.id == $scope.selectedData.publisher.id;
                }

                if(!!demandAdTag) {
                    return videoPublisher.publisher.id == demandAdTag.videoDemandPartner.publisher.id;
                }

                return false;
            });

            $scope.demandAdTag.waterfallPlacementRules.push({
                videoPublishers: videoPublishersFilter,
                waterfallTags: [],
                profitType: 3,
                profitValue: null,
                position: null,
                priority: null,
                rotationWeight: null,
                waterfalls: [null],
                publishers: [null],
                active: true
            });
        }

        function removePlacementRule(index) {
            $scope.demandAdTag.waterfallPlacementRules.splice(index, 1);
        }

        function changeProfitValueLabel($item, rule) {
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
            changeRequireBuyPrice(rule);
        }

        function changeRequireBuyPrice(rule, sellPrice) {
            rule['requiredBuyPrice'] = null;
            sellPrice = sellPrice || (!!$scope.demandAdTag ? $scope.demandAdTag.sellPrice : null);

            switch (rule.profitType) {
                case 1:
                    var requireBuyPriceByFixProfit = parseFloat(sellPrice) - rule.profitValue;
                    rule.requiredBuyPrice = requireBuyPriceByFixProfit > 0 ? requireBuyPriceByFixProfit : 0;

                    break;
                case 2:
                    var requireBuyPriceByMarginProfit = parseFloat(sellPrice) - rule.profitValue * parseFloat(sellPrice) / 100;
                    rule.requiredBuyPrice = requireBuyPriceByMarginProfit > 0 ? requireBuyPriceByMarginProfit : 0;

                    break;
                default:
                    rule.requiredBuyPrice = parseFloat(sellPrice);
                    break;
            }
        }

        function filterWaterfallTags(rule) {
            var selectedPublisherId = [];
            angular.forEach(rule.publishers, function(selectedPublisher) {
                selectedPublisherId.push(selectedPublisher.id);
            });

            rule.waterfallTags = _.filter(angular.copy($scope.waterfallTags), function(waterfallTag) {
                return _.contains(selectedPublisherId, waterfallTag.videoPublisher.id);
            });

            _changeNameWaterfallTags(rule);
        }

        function filterWaterfallTagsBySelectAll(rule) {
            rule.waterfallTags = angular.copy($scope.waterfallTags);

            _changeNameWaterfallTags(rule, rule.videoPublishers.length);
        }

        function filterWaterfallBySelectNone(rule) {
            rule.waterfallTags = [];
        }

        function isChangeTagURL() {
            isChangeTagURLValue = true;
        }


        function replaceMacros() {

            if (false == isChangeTagURLValue) {
                return;
            }

            $scope.demandAdTag.tagURL = _replaceSpaceByUTF8Code($scope.demandAdTag.tagURL);

            ReplaceMacros.replaceVideoMacros($scope.demandAdTag.tagURL)
                .then(function() {
                    $scope.demandAdTag.tagURL = ReplaceMacros.getVideoUrl();
                });

            isChangeTagURLValue = false;
        }

        function _replaceSpaceByUTF8Code(inputString) {
            if(null != inputString){
                return inputString.replace(/\s/g,"%20");
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
                    publishers: function(adminUserManager) {
                        if($scope.isAdmin() && !publishers) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }

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

            modalInstance.result.then(function() {
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
                    publishers: function(adminUserManager) {
                        if($scope.isAdmin() && !publishers) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }

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

            modalInstance.result.then(function() {
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
            if (!!$stateParams.demandPartnerId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.libraryDemandAdTag, '^.listByDemandPartner' , {id: $stateParams.demandPartnerId});
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

            _filterVideoPublisherForRule(publisher, $scope.demandAdTag.waterfallPlacementRules);
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
                    publishers: function() {
                        return publishers;
                    },
                    publisher: function() {
                        return $scope.selectedData.publisher
                    }
                }
            });

            modalInstance.result.then(function() {
                if (angular.isObject(demandPartners[0])) {
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

            dfd.promise.then(function() {
                $scope.formProcessing = true;

                // _changeWaterfallTags();
                var demandAdTag = _refactorJson();

                var saveDemandAdTag = $scope.isNew ? LibraryDemandAdTagManager.post(demandAdTag) : LibraryDemandAdTagManager.one(demandAdTag.id).patch(demandAdTag);

                saveDemandAdTag
                    .catch(
                    function(response) {
                        if(!response.data.errors) {
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
                    function() {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? $translate.instant('AD_SOURCE_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_SOURCE_MODULE.UPDATE_SUCCESS')
                        });

                        return backToListDemandAdTag();
                    });
            });


            if (_confirmSubmitForPlatform()) {
                $modal.open({
                    templateUrl: 'videoLibrary/demandAdTag/confirmSubmitPlatform.tpl.html'
                });
            } else if (_confirmSubmitForPrice()) {
                var modalInstance = $modal.open({
                    templateUrl: 'videoManagement/demandAdTag/confirmSubmit.tpl.html'
                });

                modalInstance.result.then(function() {
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
                if (confirmSubmit) {
                    return
                }

                if (parseFloat($scope.demandAdTag.sellPrice) == null || waterfall.buyPrice == null) {
                    return confirmSubmit = false;
                }

                if (waterfall.buyPrice > parseFloat($scope.demandAdTag.sellPrice)) {
                    return confirmSubmit = true;
                }
            });

            return confirmSubmit;
        }

        function _confirmSubmitForPlatform() {
            var confirm = false;

            if ($scope.demandAdTag.targeting.platform.length > 0) {
                angular.forEach($scope.selectedData.waterfallTags, function(waterfallTag) {
                    if (confirm) {
                        return
                    }

                    if (waterfallTag.platform.length < $scope.demandAdTag.targeting.platform.length) {
                        return confirm = true;
                    }

                    if (_.intersection(waterfallTag.platform, $scope.demandAdTag.targeting.platform).length == 0) {
                        return confirm = true;
                    }
                });
            }

            return confirm;
        }

        function _filterVideoPublisherForRule(publisher, waterfallPlacementRules) {
            angular.forEach(waterfallPlacementRules, function (waterfallPlacementRule) {
                waterfallPlacementRule['videoPublishers'] = _.filter(videoPublishers, function(videoPublisher) {
                    return publisher.id == videoPublisher.publisher.id;
                });
            });

            $scope.waterfallTags = _.filter(waterfallTags, function(waterfallTag) {
                return publisher.id == waterfallTag.videoPublisher.publisher.id;
            });
        }
        
        function _changeNameWaterfallTags(rule, countVideoPublisher) {
            angular.forEach(rule.waterfallTags, function(waterfallTag) {
                if (rule.publishers.length > 1 || countVideoPublisher > 1) {
                    waterfallTag.name = waterfallTag.name + ' (' + waterfallTag.videoPublisher.name + ')';
                }
            });
        }

        function _refactorJson() {
            var demandAdTag = angular.copy($scope.demandAdTag);
            var domains = [],
                excludeDomains = [];

            if (!!demandAdTag.sellPrice) {
                demandAdTag.sellPrice = NumberConvertUtil.convertPriceToString(demandAdTag.sellPrice);
            }

            angular.forEach(demandAdTag.targeting.domains, function(item) {
                if (!!item.suffixKey) {
                    domains.push(item.suffixKey);
                }
            });

            angular.forEach(demandAdTag.targeting.exclude_domains, function(item) {
                if (!!item.suffixKey) {
                    excludeDomains.push(item.suffixKey);
                }
            });

            demandAdTag.targeting.domains = domains;
            demandAdTag.targeting.exclude_domains = excludeDomains;

            if ($scope.selectedData.isDeployment && $scope.selectedData.waterfallTags.length > 0) {
                var waterfallTags = [];

                angular.forEach($scope.selectedData.waterfallTags, function(waterfallTag) {
                    waterfallTags.push(waterfallTag.id);
                });

                demandAdTag.waterfalls = waterfallTags;
            }

            var waterfallTagsId = [],
                publishersId = [];

            angular.forEach(demandAdTag.waterfallPlacementRules, function(waterfallPlacementRule) {
                waterfallTagsId = [];
                publishersId = [];

                angular.forEach(waterfallPlacementRule.waterfalls, function(waterfall) {
                    waterfallTagsId.push(waterfall.id);
                });

                angular.forEach(waterfallPlacementRule.publishers, function(publisher) {
                    publishersId.push(publisher.id);
                });

                waterfallPlacementRule.waterfalls = waterfallTagsId;
                waterfallPlacementRule.publishers = publishersId;

                delete waterfallPlacementRule.videoPublishers;
                delete waterfallPlacementRule.waterfallTags;
                delete waterfallPlacementRule.requiredBuyPrice;
            });

            delete demandAdTag.linkedCount;

            return demandAdTag;
        }
    }
})();