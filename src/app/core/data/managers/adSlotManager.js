angular.module('tagcade.core.data')

    .factory('AdSlotManager', function (Restangular) {
        'use strict';

        var RESOURCE_NAME = 'adslots';

        Restangular.extendModel(RESOURCE_NAME, function(adSlot) {
            adSlot.getSize = function() {
                var width = parseInt(this.width, 10);
                var height = parseInt(this.height, 10);

                return width + 'x' + height;
            };

            //adSlot.addRestangularMethod('reorderAdTags', 'post', 'adtags/reorder');

            return adSlot;
        });

        return Restangular.service(RESOURCE_NAME);
    })

;