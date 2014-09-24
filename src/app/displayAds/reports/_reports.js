/**
 * Extends the base reports module if the user has permission to the Display Ads module
 */

angular.module('tagcade.displayAds.reports', [
    'ui.router',

    'tagcade.reports',

    'tagcade.displayAds.reports.performanceReport'
])

;
