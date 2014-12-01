(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adTag')
        .controller('AdTagList', AdTagList)
    ;

    function AdTagList($scope, $filter, $stateParams, $q, $modal, adTags, adSlot, AdTagManager, AlertService) {
        $scope.hasAdTags = function () {
            return !!adTags.length;
        };

        if (!$scope.hasAdTags()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no ad tags in this ad slot'
            });
        }

        $scope.adSlot = adSlot;
        $scope.adTags = adTags;

        $scope.sortableOptions = {
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder',
            stop: function() {
                var tagIds = $scope.adTags.map(function (adTag) {
                    return adTag.id;
                });

                adSlot.all('adtags').customPOST({ ids: tagIds }, 'positions')
                    .catch(function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: 'The ad tags could not be reordered'
                        });

                        return $q.reject('could not reorder ad tags');
                    })
                    .then(function (adTags) {
                        $scope.adTags = adTags.plain();

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The ad tags have been reordered'
                        });
                    })
                ;
            },
            helper: function(e, ui) {
                ui.children().each(function() {
                    $(this).width($(this).width());
                });

                return ui;
            }
        };

        $scope.toggleAdTagStatus = function (adTag) {
            var newTagStatus = !adTag.active;

            AdTagManager.one(adTag.id).patch({
                'active': newTagStatus
            })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'Could not change ad tag status'
                    });

                    return $q.reject('could not update ad tag status');
                })
                .then(function () {
                    adTag.active = newTagStatus;
                })
            ;
        };

        // called when an action dropdown is opened/closed
        // we disable drag and drop sorting when it is open
        $scope.actionDropdownToggled = function (isOpen) {
            $scope.sortableOptions['disabled'] = isOpen;
        };

        $scope.confirmDeletion = function (adTag, index) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AdTagManager.one(adTag.id).remove()
                    .then(
                        function () {
                            $scope.adTags.splice(index, 1);

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: 'The ad tag was deleted'
                            });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: 'The ad tag could not be deleted'
                            });
                        }
                    )
                ;
            });
        };
    }
})();