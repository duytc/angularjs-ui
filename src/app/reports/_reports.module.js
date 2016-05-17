(function() {
    'use strict';

    angular.module('tagcade.reports', [
        'tagcade.reports.performance',
        'tagcade.reports.source',
        'tagcade.reports.billing',
        'tagcade.reports.projectedBill',
        'tagcade.reports.unified',
        'tagcade.reports.rtb'
    ]);

})();