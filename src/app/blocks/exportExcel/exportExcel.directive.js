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
                data : '=',
                cssClass: '=?',
                header: '=?',
                fields: '=?',
                reportFields: '&?',
                notFilter: '=?'
            },
            controller: function ($scope, exportExcelService) {
                $scope.class = $scope.cssClass !== undefined ? $scope.cssClass : 'btn btn-sm btn-primary';

                //var data = angular.copy($scope.data);
                update();

                $scope.click = function() {
                    update();
                    exportExcelService.exportExcel($scope.data, $scope.fields, $scope.header, $scope.filename, $scope.notFilter);
                };

                function update() {
                    var reportFields = $scope.reportFields();
                    if(!!reportFields) {
                        $scope.fields = [];
                        $scope.header = [];
                        angular.forEach(reportFields, function(field) {
                            $scope.fields.push(field.key);
                            $scope.header.push(field.label);
                        })
                    }
                }
            }
        };
    }
})();