(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.activityLog')
        .controller('ActivityLog', ActivityLog)
    ;

    function ActivityLog($scope, logs, activityLogs, ROW_LIMIT) {
        $scope.dataLogs = logs.logsList;

        var initialData = activityLogs.getInitialParams();

        $scope.showTabMenu = initialData.loginLogs;
        $scope.itemsPerPage = initialData.rowLimit;
        $scope.bigCurrentPage = setBigCurrentPage();
        $scope.bigTotalItems = logs.numRows;
        $scope.showPagination = showPagination();
        $scope.description = description;

        activityLogs.setInitialShowLoginLogs($scope.showTabMenu);

        function setBigCurrentPage() {
            var rowOff = initialData.rowOffset;
            if(!rowOff || rowOff < 1) {
                return 1;
            }

            return Math.floor(rowOff/$scope.itemsPerPage)+1;
        }

        function showPagination() {
            return angular.isArray($scope.dataLogs) && logs.numRows > ROW_LIMIT;
        }

        function description(item) {
            if($scope.showTabMenu) {
                return;
            }

            //build action
            var action = '<strong>' + item.data.action + '</strong>';

            //build entity
            var entity = item.data.entity;
            var className = entity.className == null ? '' : entity.className;
            var name = entity.name == null ? '' : ' "' + entity.name + '" ';
            var entityStr = className + name;

            //build list changed fields
            var listChangedFields = '';
            angular.forEach(item.data.changedFields, function(val) {
                var str = '';

                var fieldName = val.name;
                var oldVal = val.oldVal;
                var newVal = val.newVal;
                var startDate = val.startDate;
                var endDate = val.endDate;

                //build name value = ... to ... (for name, oldVal & newVal)
                if (fieldName != null) {
                    str += fieldName + ': ';
                }
                if (oldVal != null) {
                    str += ' <ul><li><strong>from:</strong> ' + oldVal + '</li>';

                    if (newVal != null) {
                        str += ' <li><strong>to:</strong> ' + newVal + '</li> </ul>';
                    }

                    else {
                        str += ' <li><strong>to:</strong> null</li> </ul>';
                    }
                }
                else if (newVal != null) {
                    str += newVal;
                }

                //build from ... to ... (for startDate & endDate)
                if (startDate != null) {
                    str += ' <strong>from</strong> ' + dateUtil.format(startDate);
                }
                if (endDate != null) {
                    str += ' <strong>to</strong> ' + dateUtil.format(endDate);
                }

                if(str != null){
                    listChangedFields += ('<li>' + str + '</li>');
                }
            });

            var listChangedFieldsStr = (listChangedFields.length < 1) ? '' : ('<strong>on</strong>: ' + '<ul>' + listChangedFields + '</ul>');

            //build affectedEntities
            var listAffectedEntities = '';
            angular.forEach(item.data.affectedEntities, function(val) {
                var className = val.className == null ? '' : val.className;
                var name = val.name == null ? '' : ' "' + val.name + '" ';
                var entityStr = className + name;

                if (className != null) {
                    listAffectedEntities += ('<li>' + entityStr + '</li>');
                }
            });

            var listAffectedEntitiesStr = (listAffectedEntities.length < 1) ? '' : ('<strong>related to:</strong> ' + '<ul>' + listAffectedEntities + '</ul>');

            return action + ' ' + entityStr + ' ' + listChangedFieldsStr + ' ' + listAffectedEntitiesStr;
        }
    }
})();