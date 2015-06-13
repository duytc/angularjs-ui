(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .factory('adSlotService', adSlotService)
    ;

    function adSlotService(SiteManager, DisplayAdSlotManager,  DynamicAdSlotManager, NativeAdSlotManager, TYPE_AD_SLOT_FOR_LIST, TYPE_AD_SLOT) {
        var api = {
            getManagerForAdSlot: getManagerForAdSlot,

            getAdSlotDynamic: getAdSlotDynamic,
            getTagsAdSlotDynamic: getTagsAdSlotDynamic
        };

        return api;

        function getManagerForAdSlot(adSlot) {
            var Manager;
            switch(adSlot.type) {
                case TYPE_AD_SLOT_FOR_LIST.static:
                case  TYPE_AD_SLOT.adSlot:
                    Manager = DisplayAdSlotManager;
                    break;
                case TYPE_AD_SLOT_FOR_LIST.dynamic:
                case  TYPE_AD_SLOT.dynamicAdSlot:
                    Manager = DynamicAdSlotManager;
                    break;
                case TYPE_AD_SLOT_FOR_LIST.native:
                case TYPE_AD_SLOT.nativeAdSlot:
                    Manager = NativeAdSlotManager;
                    break;
                default:
                    console.log('not found manager for ad slot');
                    return;
            }

            return Manager;
        }

        function getAdSlotDynamic(siteId) {
            return SiteManager.one(siteId).getList('dynamicadslots')
                .then(function (dynamicadslots) {
                    return dynamicadslots.plain();
                }
            );
        }

        function getTagsAdSlotDynamic(dynamicAdSlot) {
            var defaultTags = [{name: "utm_term"}, {name: "utm_source"}, {name: "utm_campaign"}, {name: "${PAGEURL}"}];
            var currentTags = _buildTags(dynamicAdSlot);

            var allTags = defaultTags.concat(currentTags);

           return array_unique(allTags);
           // return _.uniq();
        }

        function array_unique(allTags) {
            var uniqueFields = [];
            var unique = [];
            var tag;
            for (var i = 0; i < allTags.length; i++) {
                tag = allTags[i];
                if (uniqueFields.indexOf(tag.name) == -1) {
                    uniqueFields.push(tag.name);
                    unique.push(tag);
                }
            }

            return unique;
        }

        function _buildTags(dynamicAdSlot) {
            var tags = [];

            angular.forEach(dynamicAdSlot, function(adSlot) {
                angular.forEach(adSlot.expressions, function(expression) {
                    if(!expression.expressionDescriptor.groupType) {
                        tags.push({name: expression.expressionDescriptor.var});
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
                    tags.push({name: group.var});
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
