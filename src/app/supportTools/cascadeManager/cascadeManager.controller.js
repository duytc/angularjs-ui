(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.cascadeManager')
        .controller('CascadeManager', CascadeManager)
    ;

    function CascadeManager($scope, adNetworks, AdNetworkManager, AlertService) {
        $scope.adNetworks = adNetworks;
        $scope.sites = null;

        $scope.addAllOption = addAllOption;

        $scope.selected = {
            adNetwork : null,
            position: null
        };

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function addAllOption(data, label)
        {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                name: label || 'All'
            });

            return data;
        }

        $scope.groupEntities = function(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        };

        $scope.selectAdNetwork = function (adNetworkId) {
            return AdNetworkManager.one(adNetworkId).one('sites').one('active').getList()
                    .then(function (data) {
                        addAllOption(data, 'All Site');
                        $scope.sites = data.plain();
                    })
                ;
        };

        $scope.isFormValid = function() {
            return $scope.selected.adNetwork != null && $scope.selected.position != null;
        };

        $scope.submit = function () {
            var savePosition;

            if(!$scope.selected.site) {
                savePosition = AdNetworkManager.one($scope.selected.adNetwork).customPUT('', 'position', {position: $scope.selected.position});
            }
            else {
                savePosition = AdNetworkManager.one($scope.selected.adNetwork).one('sites', $scope.selected.site).customPUT('', 'position', {position: $scope.selected.position});
            }

            savePosition
                .then(
                function () {
                    AlertService.addAlert({
                        type: 'success',
                        message: 'new position is updated.'
                    });
                }
                )
                .catch(
                function () {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'Some error occurs. The position is not updated.'
                    });
                }
                );
        }
    }
})();