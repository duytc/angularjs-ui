(function () {
    'use strict';

    angular
        .module('tagcade.videoManagement.demandPartner')
        .controller('WaterfallsForDemandPartner', WaterfallsForDemandPartner)
    ;

    function WaterfallsForDemandPartner($scope, $state, $q, $modal, waterfalls, demandPartner, $modalInstance, VideoDemandPartnerManager, historyStorage, HISTORY_TYPE_PATH) {
        $scope.waterfalls = waterfalls;
        $scope.demandPartner = demandPartner;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.toggleStatus = toggleStatus;
        $scope.showPagination = showPagination;

        function toggleStatus(waterfall, newStatus) {
            var dfd = $q.defer();

            dfd.promise.then(function () {
                    var checked = newStatus ? 1 : 0;

                    if(waterfall.id == null) {
                        throw new Error('Unknown waterfall');
                    }

                    if(demandPartner.id == null) {
                        throw new Error('Unknown demandPartner');
                    }

                    var request = VideoDemandPartnerManager.one(demandPartner.id).customPUT({ 'active': checked, 'waterfallTagId': waterfall.id }, 'status');
                    request
                    .catch(
                        function () {
                            $modalInstance.close();
                        })
                    .then(
                        function () {
                            _getWaterfall();

                            historyStorage.getLocationPath(HISTORY_TYPE_PATH.demandPartner, $state.current);
                        });
                });

            if (!newStatus) {
                var confirmBox = $modal.open({
                    templateUrl: 'videoManagement/demandPartner/confirmPauseForWaterfall.tpl.html'
                });

                confirmBox.result.then(function () {
                    dfd.resolve();
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }
        }

        function _getWaterfall() {
            VideoDemandPartnerManager.one(demandPartner.id).one('waterfalltags').get()
                .then(function(data) {
                    $scope.waterfalls = data.plain();
                });
        }

        function showPagination() {
            return angular.isArray($scope.waterfalls) && $scope.waterfalls.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();