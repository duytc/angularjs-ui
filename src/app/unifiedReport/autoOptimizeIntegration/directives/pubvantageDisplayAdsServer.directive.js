(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimization')
        .directive('pubvantageDisplayAdsServer', pubvantageDisplayAdsServer)
    ;

    function pubvantageDisplayAdsServer() {
        'use strict';

        return {
            scope: {
                identifierMappings: "=",
                columnName: "=",
                siteList: "=",
                isFixSelectedSite: "=",
                adSlotListFormData: "=",
                isFixSelectedAdSlot: "=",
                supportedSegments: "=",
                autoOptimizeIntegration: "=",
                segmentFields: "=",
                countries: "=",
                optimizationRule: "=",
                isPubvantageAdServer: "=",
                videoPublisherListFormData: "=",
                waterfallTagsListFormData: "="
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/autoOptimizeIntegration/directives/pubvantageDisplayAdsServer.tpl.html',
            controller: 'PubvantageDisplayAdsServer'
        };
    }
})();