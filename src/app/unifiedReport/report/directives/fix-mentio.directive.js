(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('fixMentio', fixMentio)
    ;

    function fixMentio() {

        return {
            scope: {},
            restrict: 'A',
            link: function (scope, element, attrs) {
                console.log(element);
                console.log(attrs);

            }
        };
    }
})();