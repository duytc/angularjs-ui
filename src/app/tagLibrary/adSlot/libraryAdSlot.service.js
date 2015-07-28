(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adSlot')
        .factory('libraryAdSlotService', libraryAdSlotService)
    ;

    function libraryAdSlotService(DisplayAdSlotLibrariesManager, NativeAdSlotLibrariesManager, DynamicAdSlotLibrariesManager, TYPE_AD_SLOT) {
        var api = {
            getManagerForAdSlotLibrary: getManagerForAdSlotLibrary
        };

        return api;

        /////

        function getManagerForAdSlotLibrary(adSlot) {
            var Manager;
            switch(adSlot.type) {
                case  TYPE_AD_SLOT.display:
                    Manager = DisplayAdSlotLibrariesManager;
                    break;
                case  TYPE_AD_SLOT.dynamic:
                    Manager = DynamicAdSlotLibrariesManager;
                    break;
                case TYPE_AD_SLOT.native:
                    Manager = NativeAdSlotLibrariesManager;
                    break;
                default:
                    console.log('not found manager for ad slot');
                    return;
            }

            return Manager;
        }
    }
})();