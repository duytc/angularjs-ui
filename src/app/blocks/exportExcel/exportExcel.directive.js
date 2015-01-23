(function () {
    'use strict';

    angular.module('tagcade.blocks.export')
        .directive('exportExcel', exportExcel)
    ;

    function exportExcel() {
        'use strict';

        return {
            restrict: 'AE',
            templateUrl: 'blocks/exportExcel/exportExcel.tpl.html',
            scope: {
                filename: '=fileName',
                data : '=data',
                header: '=header',
                fields: '=fields'
            },
            controller: function ($scope, exportExcelService) {
                var data = angular.copy($scope.data);

                $scope.click = function() {
                    exportExcelService.exportExcel(data, $scope.fields, $scope.header, $scope.filename);
                }
            }
        };
    }
})();