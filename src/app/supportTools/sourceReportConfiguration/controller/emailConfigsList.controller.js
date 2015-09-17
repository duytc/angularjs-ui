(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('EmailConfigsList', EmailConfigsList)
    ;

    function EmailConfigsList($scope, $translate, $modal, $state, $stateParams, publishers, sourceReportList, AlertService, sourceReportConfig) {
        $scope.sourceReportList = sourceReportList;

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.selected = {
            publisher: null || $stateParams.publisherId
        };

        $scope.publishers = addAllOption(angular.copy(publishers), 'All Publishers');

        $scope.selectPublisher = selectPublisher;
        $scope.addNewEmailConfig = addNewEmailConfig;
        $scope.editSourceReportConfig = editSourceReportConfig;
        $scope.deleteEmailConfig = deleteEmailConfig;
        $scope.openPopupIncludedAll = openPopupIncludedAll;
        $scope.groupEntities = groupEntities;

        function groupEntities(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function addAllOption(data, label)
        {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                company: label || 'All'
            });

            return data;
        }

        function selectPublisher(publisherId) {
            if(publisherId != null) {
                return $state.transitionTo($state.current, {uniqueRequestCacheBuster: Math.random(), publisherId: publisherId});
            }

            return $state.transitionTo($state.current, {uniqueRequestCacheBuster: Math.random()});
        }

        function addNewEmailConfig() {
           $modal.open({
                templateUrl: 'supportTools/sourceReportConfiguration/views/emailConfigsForm.tpl.html',
                size : 'lg',
                controller: 'EmailConfigsForm',
                resolve: {
                    publishers: function() {
                        return publishers;
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
                            message: $translate.instant('SOURCE_CONFIG_MODULE.DELETE_EMAIL_SUCCESS')
                        });
                    })

                    .then(function() {
                        $state.go($state.current, {uniqueRequestCacheBuster: Math.random()});
                    })

                    .catch(function() {
                        AlertService.addAlert({
                            type: 'error',
                            message: $translate.instant('SOURCE_CONFIG_MODULE.DELETE_EMAIL_FAIL')
                        });
                    });
            })
        }
    }
})();