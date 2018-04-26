(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .controller('PubvantageDisplayAdsServer', PubvantageDisplayAdsServer)
    ;

    function PubvantageDisplayAdsServer($scope, DOMAINS_LIST_SEPARATOR) {
        $scope.toggleDimension = toggleDimension;
        $scope.hasDimension = hasDimension;
        $scope.getNameSegments = getNameSegments;
        $scope.addDomain = addDomain;
        $scope.filterFactor = filterFactor;

        function filterFactor(currentFactor) {
            return function (factor) {
                if (!factor) {
                    return false
                }

                for (var index in $scope.autoOptimizeIntegration.segments) {
                    var segment = $scope.autoOptimizeIntegration.segments[index];

                    if (segment.toFactor == factor && segment.toFactor != currentFactor) {
                        return false
                    }
                }

                return true
            }
        }

        function toggleDimension(key) {
            var index = _.findIndex($scope.autoOptimizeIntegration.segments, {dimension: key});
            if (index > -1) {
                $scope.autoOptimizeIntegration.segments.splice(index, 1)
            } else {
                $scope.autoOptimizeIntegration.segments.push(
                    {
                        dimension: key,
                        toFactor: null,
                        neededValue: []
                    }
                )
            }
        }

        function hasDimension(key) {
            return _.findIndex($scope.autoOptimizeIntegration.segments, {dimension: key}) > -1;
        }

        function getNameSegments(segmentKey) {
            return _.find($scope.supportedSegments, {key: segmentKey}).label
        }
        function addDomain(query, neededValue) {
            var hasSeparator = false;

            angular.forEach(DOMAINS_LIST_SEPARATOR, function (key) {
                if (query.indexOf(key) > -1 && !hasSeparator) {
                    hasSeparator = true;
                    var domains = query.split(key);

                    angular.forEach(domains, function (domain, index) {
                        domain = domain.toLowerCase();

                        if (!/^(?:[\*]?\.)?(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(domain)) {
                            return
                        }

                        if (neededValue.indexOf(domain) > -1) {
                            return
                        }

                        neededValue.push(domain);
                    });
                }
            });

            if (hasSeparator) {
                return '';
            }

            if (!/^(?:[\*]?\.)?(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(query)) {
                return
            }

            if (neededValue.indexOf(query.toLowerCase()) > -1) {
                return
            }

            return query.toLowerCase();
        }
    }
})();