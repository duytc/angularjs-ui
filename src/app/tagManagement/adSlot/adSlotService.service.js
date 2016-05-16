(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .factory('adSlotService', adSlotService)
    ;

    function adSlotService(SiteManager, DisplayAdSlotManager,  DynamicAdSlotManager, NativeAdSlotManager, TYPE_AD_SLOT) {
        var api = {
            getManagerForAdSlot: getManagerForAdSlot,

            getAdSlotDynamic: getAdSlotDynamic,
            getTagsAdSlotDynamic: getTagsAdSlotDynamic
        };

        return api;

        function getManagerForAdSlot(adSlot) {
            var Manager;
            switch(adSlot.type) {
                case  TYPE_AD_SLOT.display:
                    Manager = DisplayAdSlotManager;
                    break;
                case  TYPE_AD_SLOT.dynamic:
                    Manager = DynamicAdSlotManager;
                    break;
                case TYPE_AD_SLOT.native:
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
            var defaultTags = [{name: "utm_term"}, {name: "utm_source"}, {name: "utm_campaign"}, {name: "${PAGE_URL}"}, {name: "${USER_AGENT}"}, {name: "${COUNTRY}"}, {name: "${SCREEN_WIDTH}"}, {name: "${SCREEN_HEIGHT}"}, {name: "${WINDOW_WIDTH}"}, {name: "${WINDOW_HEIGHT}"}, {name: "${DOMAIN}"}, {name: "${DEVICE}"}];
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
                if(angular.isObject(adSlot.libraryAdSlot))
                // update for ad slot normal and library ad slot
                adSlot = !!adSlot.libraryAdSlot ? adSlot.libraryAdSlot : adSlot;

                angular.forEach(adSlot.libraryExpressions, function(expression) {
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
