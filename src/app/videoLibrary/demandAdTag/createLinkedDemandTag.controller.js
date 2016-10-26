(function() {
    'use strict';

    angular.module('tagcade.videoLibrary.demandAdTag')
        .controller('CreateLinkedDemandAdTag', CreateLinkedDemandAdTag)
    ;

    function CreateLinkedDemandAdTag($scope, _, $modal, $q, $filter, $translate, AlertService, videoPublishers, $modalInstance, waterfallTags, demandAdTag, LibraryDemandAdTagManager) {
        $scope.selectData = {
            waterfalls: [],
            videoPublishers: [],
            position: null,
            shiftDown: null,
            priority: null,
            rotationWeight: null,
            active: true,
            filters: ['all']
        };

        $scope.selectFilterData = {
            waterfallSelection: 'manual',
            requiredBuyPrice: null
        };

        $scope.waterfallSelectionOptions = [
            {label: 'Manual', key: 'manual'},
            {label: 'Profit Margin', key: 'profitMargin'},
            {label: 'Fixed Profit', key: 'fixedProfit'}
        ];

        $scope.videoPublishers = videoPublishers;
        $scope.waterfallTags = [];
        $scope.waterfallTagsHaveBuyPriceHigherSellPriceLibraryDemandAdTag = [];
        $scope.demandAdTag = demandAdTag;

        $scope.isFormValid = isFormValid;
        $scope.toggleFilter =  toggleFilter;
        $scope.hasFilter =  hasFilter;
        $scope.disabledFilter = disabledFilter;
        $scope.selectWaterfallSelection = selectWaterfallSelection;
        $scope.setRequiredBuyPrice = setRequiredBuyPrice;

        function selectWaterfallSelection(option) {
            $scope.selectFilterData.requiredBuyPrice =  (option.key != 'manual')? demandAdTag.sellPrice: null;

            _filterWaterfallByVideoPublisherAndBuyPrice($scope.selectFilterData.requiredBuyPrice);
        }

        function setRequiredBuyPrice(value) {
            if($scope.selectFilterData.waterfallSelection =='profitMargin'){
                $scope.selectFilterData.requiredBuyPrice = $scope.demandAdTag.sellPrice - ((value/100) * $scope.demandAdTag.sellPrice);
            } else if($scope.selectFilterData.waterfallSelection == 'fixedProfit') {
                $scope.selectFilterData.requiredBuyPrice = $scope.demandAdTag.sellPrice - value;
            }

            _filterWaterfallByVideoPublisherAndBuyPrice($scope.selectFilterData.requiredBuyPrice);
        }
        
        function disabledFilter(filter) {
            if($scope.selectData.filters.indexOf('all') > -1) {
                if(filter != 'all') {
                    return true;
                }
            } else {
                if($scope.selectData.filters.length > 0) {
                    if(filter == 'all') {
                        return true;
                    }
                }
            }

            return false;
        }

        function hasFilter(player) {
            if(!$scope.selectData.filters) {
                return false;
            }

            return $scope.selectData.filters.indexOf(player) > -1;
        }

        function toggleFilter(player) {
            var idx = $scope.selectData.filters.indexOf(player);

            if (idx > -1) {
                $scope.selectData.filters.splice(idx, 1);
            } else {
                $scope.selectData.filters.push(player);
            }

            // filter
            $scope.selectData.waterfalls = [];
            var videoPublisher = _.find(videoPublishers, function(vPub) { return vPub.id == $scope.selectData.videoPublisher});

            _filterWaterfallByVideoPublisherAndBuyPrice(videoPublisher);
        }

        function isFormValid() {
            return $scope.selectData.waterfalls.length;
        }

        $scope.submit = function() {
            var dfd = $q.defer();

            dfd.promise.then(function () {
                $modalInstance.close();
                _refactorData();

                LibraryDemandAdTagManager.one(demandAdTag.id).customPOST($scope.selectData, 'createlinks')
                    .then(function() {
                        $scope.demandAdTag.linkedCount = Number($scope.demandAdTag.linkedCount) + $scope.selectData.waterfalls.length;

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('AD_SOURCE_LIBRARY_MODULE.LINK_DEMAND_AD_TAG_SUCCESS')
                        });
                    })
                    .catch(function() {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: $translate.instant('AD_SOURCE_LIBRARY_MODULE.LINK_DEMAND_AD_TAG_FAIL')
                        });
                    }
                );
            });

            if (confirmSubmit()) {
                var modalInstance = $modal.open({
                    templateUrl: 'videoManagement/demandAdTag/confirmSubmit.tpl.html',
                    controller: function($scope, waterfallTags) {
                        $scope.waterfallTags = waterfallTags;
                    },
                    resolve: {
                        waterfallTags: function() {
                            return $scope.waterfallTagsHaveBuyPriceHigherSellPriceLibraryDemandAdTag;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        };

        function confirmSubmit() {
            $scope.waterfallTagsHaveBuyPriceHigherSellPriceLibraryDemandAdTag = [];
            var confirmSubmit = false;

            angular.forEach($scope.selectData.waterfalls, function(waterfall) {
                if(confirmSubmit) {
                    return
                }

                if(demandAdTag.sellPrice == null || waterfall.buyPrice == null) {
                    return confirmSubmit = false;
                }

                if(waterfall.buyPrice > demandAdTag.sellPrice) {
                    $scope.waterfallTagsHaveBuyPriceHigherSellPriceLibraryDemandAdTag.push(waterfall);
                    return confirmSubmit = true;
                }
            });

            return confirmSubmit;
        }

        function _refactorData() {
            var waterfalls = [];

            delete $scope.selectData.videoPublisher;
            delete $scope.selectData.filters;

            angular.forEach($scope.selectData.waterfalls, function(waterfall) {
                waterfalls.push(waterfall.id)
            });

            $scope.selectData.waterfalls = waterfalls;
        }

        function _filterWaterfallByVideoPublisherAndBuyPrice(requiredBuyPrice) {
            var videoPublisherIds = [];

            angular.forEach($scope.selectData.videoPublishers, function (videoPublisher) {
                videoPublisherIds.push(videoPublisher.id)
            });

            $scope.waterfallTags = $filter('filter')(angular.copy(waterfallTags), function(waterfall) {
                if(_.contains(videoPublisherIds, waterfall.videoPublisher.id)){
                    return requiredBuyPrice ? (requiredBuyPrice >= waterfall.buyPrice) : true;
                }

                return false
            })
        }

        $scope.$watch('selectData.videoPublishers', function () {
            _filterWaterfallByVideoPublisherAndBuyPrice($scope.selectFilterData.requiredBuyPrice);
        })
    }
})();