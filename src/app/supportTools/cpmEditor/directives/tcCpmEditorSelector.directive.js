(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .directive('tcCpmEditorSelector', tcCpmEditorSelector)
    ;

    function tcCpmEditorSelector() {
        return {
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'supportTools/cpmEditor/directives/tcCpmEditorSelector.tpl.html',
            controller: 'CpmEditorSelector'
        }
    }
})();