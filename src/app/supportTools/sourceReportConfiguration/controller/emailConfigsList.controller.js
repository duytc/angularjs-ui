(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('EmailConfigsList', EmailConfigsList)
    ;

    function EmailConfigsList($scope, $modal, $state, sourceReportList, AlertService, sourceReportConfig) {
        $scope.sourceReportList = sourceReportList;

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.addNewEmailConfig = addNewEmailConfig;
        $scope.editSourceReportConfig = editSourceReportConfig;
        $scope.deleteEmailConfig = deleteEmailConfig;
        $scope.openPopupIncludedAll = openPopupIncludedAll;

        function addNewEmailConfig() {
           $modal.open({
                templateUrl: 'supportTools/sourceReportConfiguration/views/emailConfigsForm.tpl.html',
                size : 'lg',
                controller: 'EmailConfigsForm',
                resolve: {
                    publishers: function() {
                        return sourceReportConfig.getPublishers();
                    }
                }
            });
        }

        function editSourceReportConfig(emailConfig) {
            $modal.open({
                templateUrl: 'supportTools/sourceReportConfiguration/views/emailConfigsEdit.tpl.html',
                controller: 'EmailConfigsEdit',
                resolve: {
                    emailConfig: function() {
                        return angular.copy(emailConfig);
                    }
                }
            });
        }

        function openPopupIncludedAll() {
            $modal.open({
                templateUrl: 'supportTools/sourceReportConfiguration/views/alertIncludedAll.tpl.html'
            });
        }

        function deleteEmailConfig(emailId) {
            var modalInstance = $modal.open({
                templateUrl: 'supportTools/sourceReportConfiguration/views/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return sourceReportConfig.deleteEmailConfig(emailId)
                    .then(function() {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The email config has been deleted'
                        });
                    })

                    .then(function() {
                        $state.reload();
                    })

                    .catch(function() {
                        AlertService.addAlert({
                            type: 'error',
                            message: 'The email config not been deleted'
                        });
                    });
            })
        }
    }
})();