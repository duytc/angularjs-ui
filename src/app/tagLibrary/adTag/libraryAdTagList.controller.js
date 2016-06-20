(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagList', LibraryAdTagList)
    ;

    function LibraryAdTagList($scope, $translate, $modal, adTags, AlertService, AdTagLibrariesManager, SiteManager, historyStorage, adminUserManager, HISTORY_TYPE_PATH, TYPE_AD_SLOT, AtSortableService) {
        $scope.adTags = adTags;

        $scope.hasData = function () {
            return !!adTags.length;
        };

        $scope.adSlotTypes = TYPE_AD_SLOT;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AD_TAG_LIBRARY_MODULE.CURRENTLY_NO_AD_TAG')
            });
        }

        $scope.showPagination = showPagination;
        $scope.removeMoveToLibrary = removeMoveToLibrary;
        $scope.updateAdTag = updateAdTag;
        $scope.createLinkedAdAdTag = createLinkedAdAdTag;

        function showPagination() {
            return angular.isArray($scope.adTags) && $scope.adTags.length > $scope.tableConfig.itemsPerPage;
        }

        function removeMoveToLibrary(adTag) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdTagLibrariesManager.one(adTag.id).remove()
                    .then(function () {
                        var index = adTags.indexOf(adTag);

                        if (index > -1) {
                            adTags.splice(index, 1);
                        }

                        $scope.adTags = adTags;

                        if($scope.tableConfig.currentPage > 0 && adTags.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('AD_TAG_LIBRARY_MODULE.REMOVE_SUCCESS')
                        });
                    })
                    .catch(function (status) {
                        var message;

                        if(!!status && !!status.data && !!status.data.message) {
                            message = status.data.message
                        }
                        else {
                            message = $translate.instant('AD_TAG_LIBRARY_MODULE.REMOVE_FAIL')
                        }

                        AlertService.replaceAlerts({
                            type: 'error',
                            message: message
                        });
                    })
                    ;
            })
        }

        function updateAdTag(data, field, adtag) {
            if(adtag[field] == data) {
                return;
            }

            var saveField = angular.copy(adtag[field]);
            adtag[field] = data;
            var item = angular.copy(adtag);
            delete item.associatedTagCount;

            AdTagLibrariesManager.one(item.id).patch(item)
                .then(function() {
                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(function() {
                    adtag[field] = saveField;

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AD_TAG_MODULE.UPDATE_FAIL')
                    });
                });
        }

        function createLinkedAdAdTag(adTag) {
            var sites = null;

            if($scope.isAdmin()) {
                sites = adminUserManager.one(adTag.adNetwork.publisher.id).one('sites').getList();
            } else {
                sites = SiteManager.getList()
            }

            sites.then(function(sites) {
                if(!!sites.length) {
                    $modal.open({
                        templateUrl: 'tagLibrary/adTag/createLinkedAdTags.tpl.html',
                        size: 'lg',
                        controller: 'CreateLinkedAdTags',
                        resolve: {
                            adTag: function () {
                                return adTag;
                            },
                            sites: function() {
                                return sites
                            }
                        }
                    });
                }
                else {
                    AlertService.replaceAlerts({
                        type: 'warning',
                        message: $translate.instant('AD_SLOT_LIBRARY_MODULE.ALERT_CREATE_LINKED_AD_SLOTS_FULL_SITE')
                    });
                }
            });
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.adTagLibrary)
        });
    }
})();