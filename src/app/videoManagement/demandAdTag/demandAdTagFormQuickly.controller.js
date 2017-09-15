(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandAdTag')
        .controller('DemandAdTagFormQuickly', DemandAdTagFormQuickly);

    function DemandAdTagFormQuickly($scope, _, $state, $q, $modal, $translate, AlertService, NumberConvertUtil, ReplaceMacros, $modalInstance, Auth, publisher, position, whiteList, blackList, videoWaterfallTag, videoWaterfallTagItems, videoDemandAdTag, LibraryDemandAdTagManager, demandPartners, publishers, VideoDemandAdTagManager, ServerErrorProcessor, STRATEGY_OPTION, PLATFORM_OPTION, PLAYER_SIZE_OPTIONS, REQUIRED_MACROS_OPTIONS, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        var positionRoot = angular.copy(position);

        $scope.isNew = !videoDemandAdTag;
        $scope.formProcessing = false;
        $scope.isAdmin = Auth.isAdmin();
        $scope.hasPublisher = !!publisher;

        $scope.whiteList = whiteList;
        $scope.blackList = blackList;

        $scope.demandAdTagLibraryList = [];
        $scope.pickFromLibrary = false;

        $scope.platformOption = [];
        angular.forEach(videoWaterfallTag.platform, function(platformItem) {
            var platform = _.find(PLATFORM_OPTION, function(value) {
                return platformItem == value.key
            });

            $scope.platformOption.push(platform);
        });

        $scope.playerSizeOptions = PLAYER_SIZE_OPTIONS;
        $scope.countries = COUNTRY_LIST;
        $scope.strategyOption = STRATEGY_OPTION;
        $scope.requiredMacrosOptions = REQUIRED_MACROS_OPTIONS;

        $scope.publishers = publishers;
        $scope.videoWaterfallTag = videoWaterfallTag;
        $scope.demandPartners = demandPartners;
        $scope.videoWaterfallTagItems = videoWaterfallTagItems;
        $scope.videoWaterfallTagItemsClone = angular.isArray(videoWaterfallTagItems) ? ($scope.isNew ? addAllOption(angular.copy(videoWaterfallTagItems)) : angular.copy(videoWaterfallTagItems)) : [];

        $scope.videoDemandAdTag = angular.copy(videoDemandAdTag) || {
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
            requestCap: null,
            targetingOverride: false
        };

        if (!$scope.isNew) {
            $scope.videoDemandAdTag.libraryVideoDemandAdTag.sellPrice = NumberConvertUtil.convertPriceToString($scope.videoDemandAdTag.libraryVideoDemandAdTag.sellPrice);

            if ($scope.videoDemandAdTag.targetingOverride) {
                $scope.videoDemandAdTag.libraryVideoDemandAdTag.targeting = $scope.videoDemandAdTag.targeting;
            }

            $scope.videoDemandAdTag.activeClone = $scope.videoDemandAdTag.active > 0;
        }

        $scope.selectedData = {
            publisher: publisher,
            position: (typeof position == 'number') ? position : $scope.videoWaterfallTagItemsClone.length - 1
        };

        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.addDomain = addDomain;
        $scope.findPublisher = findPublisher;
        $scope.createVideoDemandPartner = createVideoDemandPartner;
        $scope.selectVideoDemandPartner = selectVideoDemandPartner;
        $scope.findLabelStrategy = findLabelStrategy;
        $scope.filterExcludeCountriesSelected = filterExcludeCountriesSelected;
        $scope.filterCountriesSelected = filterCountriesSelected;
        $scope.getDemandAdTagLibrary = getDemandAdTagLibrary;
        $scope.selectDemandAdTagLibrary = selectDemandAdTagLibrary;
        $scope.filterByPublisher = filterByPublisher;
        $scope.createQuicklyBlackLink = createQuicklyBlackLink;
        $scope.createQuicklyWhiteLink = createQuicklyWhiteLink;
        $scope.viewQuicklyWhiteLink = viewQuicklyWhiteLink;
        $scope.viewQuicklyBlackLink = viewQuicklyBlackLink;
        $scope.replaceMacros = replaceMacros;
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

        var isChangeTagURLValue = false;
        $scope.isChangeTagURL = isChangeTagURL;

        function isChangeTagURL() {
            isChangeTagURLValue = true;
        }

        function replaceMacros() {

            if (false == isChangeTagURLValue) {
                return;
            }
            $scope.videoDemandAdTag.libraryVideoDemandAdTag.tagURL = _replaceSpaceByUTF8Code($scope.videoDemandAdTag.libraryVideoDemandAdTag.tagURL);

            ReplaceMacros.replaceVideoMacros($scope.videoDemandAdTag.libraryVideoDemandAdTag.tagURL)
                .then(function() {
                    $scope.videoDemandAdTag.libraryVideoDemandAdTag.tagURL = ReplaceMacros.getVideoUrl();
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
                    publishers: function(adminUserManager) {
                        if($scope.isAdmin && !publishers) {
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
                        if($scope.isAdmin && !publishers) {
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
                        return $scope.whiteList
                    }
                }
            });
        }

        function filterByPublisher(libraryDemandAdTag) {
            if (!$scope.selectedData.publisher) {
                return false;
            }

            var publisher = !!$scope.selectedData.publisher.id ? $scope.selectedData.publisher.id : $scope.selectedData.publisher;
            if (!publisher || libraryDemandAdTag.videoDemandPartner.publisher.id != publisher) {
                return false;
            }

            return true;
        }

        function selectDemandAdTagLibrary(libraryVideoDemandAdTag) {
            angular.extend($scope.videoDemandAdTag.libraryVideoDemandAdTag, libraryVideoDemandAdTag);
        }

        function getDemandAdTagLibrary() {
            if ($scope.pickFromLibrary && $scope.demandAdTagLibraryList.length == 0) {
                LibraryDemandAdTagManager.getList()
                    .then(function(libraryDemandAdTag) {
                        $scope.demandAdTagLibraryList = libraryDemandAdTag.plain();
                    });
            }

            // reset form when pickFromLibrary = false
            if (!$scope.pickFromLibrary) {
                $scope.videoDemandAdTag = angular.copy(videoDemandAdTag) || {
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
                    active: true,
                    rotationWeight: null,
                    targetingOverride: false
                };
            }

            // reset targetingOverride to false
            $scope.targetingOverride = false;
        }

        function selectPublisher(publisher) {
            $scope.videoDemandAdTag.libraryVideoDemandAdTag.videoDemandPartner = null
        }

        function addDomain(query) {
            if ($scope.videoDemandAdTag.libraryVideoDemandAdTag.targeting.exclude_domains.indexOf(query) > -1 || $scope.videoDemandAdTag.libraryVideoDemandAdTag.targeting.domains.indexOf(query) > -1) {
                return;
            }

            return query;
        }

        function isFormValid() {
            return $scope.videoDemandAdTagForm.$valid;
        }

        function findPublisher() {
            return _.find(publishers, function(item) {
                return item.id == publisher.id || item.id == publisher
            });
        }

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function addAllOption(data, label) {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.push({
                strategy: label || 'Add New',
                position: videoWaterfallTagItems.length
            });

            return data;
        }

        function selectVideoDemandPartner(videoDemandPartner) {
            $scope.videoDemandAdTag.libraryVideoDemandAdTag.name = videoDemandPartner.name;
        }

        function findLabelStrategy(strategyKey) {
            var strategy = _.find($scope.strategyOption, function(option) {
                return option.key == strategyKey;
            });

            if (!!strategy) {
                return strategy.label
            }

            return '';
        }

        function filterExcludeCountriesSelected(country) {
            return $scope.videoDemandAdTag.libraryVideoDemandAdTag.targeting.exclude_countries.indexOf(country.code) == -1
        }

        function filterCountriesSelected(country) {
            return $scope.videoDemandAdTag.libraryVideoDemandAdTag.targeting.countries.indexOf(country.code) == -1
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
                    $scope.videoDemandAdTag.libraryVideoDemandAdTag.videoDemandPartner = videoDemandPartner.id;

                    $scope.videoDemandAdTag.libraryVideoDemandAdTag.name = videoDemandPartner.name;
                }
            })
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            var dfd = $q.defer();

            dfd.promise.then(function() {
                $scope.formProcessing = true;
                var demandAdTag = _refactorJson($scope.videoDemandAdTag);

                var saveDemandAdTag = $scope.isNew ? VideoDemandAdTagManager.post(demandAdTag) : VideoDemandAdTagManager.one(demandAdTag.id).patch(demandAdTag);
                saveDemandAdTag
                    .catch(
                    function(response) {
                        $modalInstance.close();

                        if (!response.data.errors) {
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: response.data.message
                            });
                        }

                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.videoDemandAdTagForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    })
                    .then(
                    function(videoDemandAdTagResponse) {
                        //if($scope.isNew) {
                        //    if(!!videoWaterfallTagItems) {
                        //        if(hasNewVideoWaterfallTagItem()) {
                        //            videoWaterfallTagItems.push(
                        //                {
                        //                    strategy: $scope.selectedData.strategy,
                        //                    videoDemandAdTags: [videoDemandAdTagResponse],
                        //                    position: $scope.selectedData.position
                        //                }
                        //            );
                        //        } else {
                        //            if($scope.selectedData.autoIncreasePosition) {
                        //                videoWaterfallTagItems.splice($scope.selectedData.position, 0, {
                        //                    videoDemandAdTags: [videoDemandAdTagResponse],
                        //                    strategy: 'linear',
                        //                    position: $scope.selectedData.position
                        //                });
                        //            } else {
                        //                videoWaterfallTagItems[$scope.selectedData.position].videoDemandAdTags.push(videoDemandAdTagResponse)
                        //            }
                        //        }
                        //    }
                        //
                        //    AlertService.replaceAlerts({
                        //        type: 'success',
                        //        message: $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_SUCCESS')
                        //    });
                        //
                        //}
                        //else {
                        //    // reload state
                        //    $state.reload();
                        //
                        //    angular.extend(videoDemandAdTag, $scope.videoDemandAdTag);
                        //
                        //    if(positionRoot != $scope.selectedData.position || $scope.selectedData.autoIncreasePosition) {
                        //        var indexVideoAdTagItem = _.findIndex(videoWaterfallTagItems[positionRoot].videoDemandAdTags, function(videoDemandAdTag) {
                        //            return videoDemandAdTag.id == videoDemandAdTag.id;
                        //        });
                        //        // remove indexVideoAdTagItem old
                        //        videoWaterfallTagItems[positionRoot].videoDemandAdTags.splice(indexVideoAdTagItem, 1);
                        //
                        //        // add in video adtag item new
                        //        if($scope.selectedData.autoIncreasePosition) {
                        //            videoWaterfallTagItems.splice($scope.selectedData.position, 0, {
                        //                videoDemandAdTags: [videoDemandAdTag],
                        //                strategy: 'linear',
                        //                position: $scope.selectedData.position
                        //            });
                        //        } else {
                        //            videoWaterfallTagItems[$scope.selectedData.position].videoDemandAdTags.push(videoDemandAdTag);
                        //        }
                        //    }
                        //
                        //    AlertService.addFlash({
                        //        type: 'success',
                        //        message: $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_SUCCESS')
                        //    });
                        //
                        //}

                        if(angular.isArray(videoWaterfallTagItems)) {
                            $state.reload();
                            AlertService.addFlash({
                                type: 'success',
                                message: $translate.instant('VIDEO_AD_TAG_MODULE.UPDATE_SUCCESS')
                            });
                        }else {
                            AlertService.replaceAlerts({
                                type: 'success',
                                message: $translate.instant('AD_SOURCE_MODULE.UPDATE_SUCCESS')
                            });
                        }



                        $modalInstance.close();
                    });
            });

            if (videoWaterfallTag.buyPrice != null && $scope.videoDemandAdTag.libraryVideoDemandAdTag.sellPrice != null && videoWaterfallTag.buyPrice > $scope.videoDemandAdTag.libraryVideoDemandAdTag.sellPrice) {
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

        function _refactorJson(videoDemandAdTag) {
            var demandAdTag = angular.copy(videoDemandAdTag);
            demandAdTag.libraryVideoDemandAdTag.videoDemandPartner = demandAdTag.libraryVideoDemandAdTag.videoDemandPartner.id || demandAdTag.libraryVideoDemandAdTag.videoDemandPartner;
            demandAdTag.libraryVideoDemandAdTag.sellPrice = NumberConvertUtil.convertPriceToString(demandAdTag.libraryVideoDemandAdTag.sellPrice);

            // add new demand ad tag and videoWaterfallTagItem
            if (hasNewVideoWaterfallTagItem()) {
                demandAdTag.videoWaterfallTagItem = {
                    strategy: $scope.selectedData.strategy,
                    position: $scope.selectedData.position,
                    videoWaterfallTag: videoWaterfallTag.id
                };
            } else {
                // shiftdown
                if ($scope.selectedData.autoIncreasePosition) {
                    demandAdTag.videoWaterfallTagItem = {
                        strategy: 'linear',
                        position: $scope.selectedData.position,
                        videoWaterfallTag: videoWaterfallTag.id
                    };
                } else {
                    var videoWaterfallTagItem = _.find(videoWaterfallTagItems, function(item) {
                        return item.position == $scope.selectedData.position;
                    });

                    demandAdTag.videoWaterfallTagItem = angular.isObject(videoWaterfallTagItem) ? videoWaterfallTagItem.id : demandAdTag.videoWaterfallTagItem;
                }
            }

            //var domains = [], excludeDomains = [];
            //
            //angular.forEach(demandAdTag.libraryVideoDemandAdTag.targeting.domains, function(item) {
            //    domains.push(item.suffixKey);
            //});
            //angular.forEach(demandAdTag.libraryVideoDemandAdTag.targeting.exclude_domains, function(item) {
            //    excludeDomains.push(item.suffixKey);
            //});
            //
            //demandAdTag.libraryVideoDemandAdTag.targeting.domains = domains;
            //demandAdTag.libraryVideoDemandAdTag.targeting.exclude_domains = excludeDomains;

            if (demandAdTag.targetingOverride) {
                demandAdTag.targeting = demandAdTag.libraryVideoDemandAdTag.targeting;
                // targeting root
                delete demandAdTag.libraryVideoDemandAdTag.targeting;
            } else {
                if (!$scope.isNew && demandAdTag.libraryVideoDemandAdTag.linkedCount > 1) {
                    delete demandAdTag.libraryVideoDemandAdTag.targeting;
                }
            }

            if (!$scope.pickFromLibrary) {
                delete demandAdTag.libraryVideoDemandAdTag.id;
            }

            if (typeof demandAdTag.activeClone != 'number') {
                demandAdTag.active = demandAdTag.activeClone ? 1 : 0
            }
            delete demandAdTag.activeClone;

            delete demandAdTag.libraryVideoDemandAdTag.linkedCount;
            delete demandAdTag.profit;

            return demandAdTag;
        }

        function hasNewVideoWaterfallTagItem() {
            return !!$scope.selectedData.strategy && ($scope.selectedData.position + 1) > videoWaterfallTagItems.length
        }
    }
})();