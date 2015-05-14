(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .factory('adSlotService', adSlotService)
    ;

    function adSlotService(SiteManager, _) {
        var api = {
            getAdSlotDynamic: getAdSlotDynamic,
            getTagsAdSlotDynamic: getTagsAdSlotDynamic
        };

        return api;

        function getAdSlotDynamic(siteId) {
            return SiteManager.one(siteId).getList('dynamicadslots')
                .then(function (dynamicadslots) {
                    return dynamicadslots.plain();
                }
            );
        }

        function getTagsAdSlotDynamic(dynamicAdSlot) {
            var defaultTags = ["utm_term", "utm_source", "utm_campaign", "utm_medium", "${PAGEURL}"];
            var currentTags = _buildTags(dynamicAdSlot);

            return _.uniq(defaultTags.concat(currentTags));
        }

        function _buildTags(dynamicAdSlot) {
            var tags = [];

            angular.forEach(dynamicAdSlot, function(adSlot) {
                angular.forEach(adSlot.expressions, function(expression) {
                    if(!expression.expressionDescriptor.groupType) {
                        tags.push(expression.expressionDescriptor.var);
                    }
                    else {
                        angular.forEach(_buildTagsNested(expression.expressionDescriptor.groupVal), function(tag) {
                            return  tags.push(tag);
                        })
                    }
                })
            });

            return tags;
        }

        function _buildTagsNested(item) {
            var tags = [];

            angular.forEach(item, function(group) {
                if(!group.groupType) {
                    tags.push(group.var);
                }
                else {
                    angular.forEach(_buildTagsNested(group.groupVal), function(tag) {
                        return tags.push(tag);
                    })
                }
            });

            return tags;
        }
    }
})();
