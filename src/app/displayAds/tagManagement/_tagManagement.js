/**
 * Extends the base tag management module if the user has permission to the Display Ads module
 */

angular.module('tagcade.displayAds.tagManagement', [
    'ui.router',

    'tagcade.tagManagement', // base module

    'tagcade.displayAds.tagManagement.adNetwork',
    'tagcade.displayAds.tagManagement.adSlot',
    'tagcade.displayAds.tagManagement.adTag'
])

;