(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .controller('AddMappingController', AddMappingController)
    ;

    function AddMappingController($scope, $modalInstance, adTag, identifiers, columnName, autoOptimizeIntegration, autoOptimizeConfig) {
        $scope.autoOptimizeIntegration = autoOptimizeIntegration;
        $scope.autoOptimizeConfig = autoOptimizeConfig;
        $scope.adTag = adTag;
        $scope.identifiers = identifiers;

        $scope.selected = {
            adTag: adTag,
            identifier: _findIdentifier(adTag)
        };

        $scope.isFormValid = function() {
            return $scope.adTagMapping.$valid;
        };
        
        $scope.submit = submit;
        $scope.showIdentifier = showIdentifier;
        $scope.filterNull = filterNull;

        function filterNull(identifier) {
            return !!identifier
        }

        function showIdentifier(identifier) {
            identifier = angular.copy(identifier);
            angular.forEach(columnName, function replace(value, key) {
                if (!angular.isString(identifier)) {
                    return null;
                }

                var regExp = new RegExp(key.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
                identifier = identifier.replace(regExp, value);
            });

            return identifier
        }

        function submit() {
            $modalInstance.close();

            var index = _.findIndex($scope.autoOptimizeIntegration.autoOptimizeIntegrationAdTagsMappings, function (item) {
                return item.adTag == $scope.adTag.id || item.adTag.id == $scope.adTag.id
            });

            if(index == -1) {
                $scope.autoOptimizeIntegration.autoOptimizeIntegrationAdTagsMappings.push($scope.selected);
            } else {
                $scope.autoOptimizeIntegration.autoOptimizeIntegrationAdTagsMappings[index] = $scope.selected
            }
        }

        function _findIdentifier(adTag) {
            var mapping =  _.find($scope.autoOptimizeIntegration.autoOptimizeIntegrationAdTagsMappings, function (item) {
                return item.adTag == adTag.id || item.adTag.id == adTag.id
            });

            return !!mapping ? mapping.identifier : null
        }
    }
})();