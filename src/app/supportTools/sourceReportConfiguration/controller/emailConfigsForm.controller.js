(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('EmailConfigsForm', EmailConfigsForm)
    ;

    function EmailConfigsForm($scope, $state, AlertService, publishers, sourceReportConfig) {
        $scope.publishers = publishers;

        $scope.emailReceive = [{id: 1}];
        $scope.sitesHasConfig = [];
        $scope.selected = {
            publisher: null,
            includedAll: false
        };

        $scope.addEmailInput = addEmailInput;
        $scope.removeEmailInput = removeEmailInput;
        $scope.selectPublisher = selectPublisher;
        $scope.sitesHasConfigPush = sitesHasConfigPush;
        $scope.sitesHasConfigPushAll = sitesHasConfigPushAll;
        $scope.sitesHasConfigDrop = sitesHasConfigDrop;
        $scope.sitesHasConfigDropAll = sitesHasConfigDropAll;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function selectPublisher(publisherId) {
            sourceReportConfig.getSiteByPublisher(publisherId)
            .then(function(sites) {
                 $scope.sitesNoConfig = sourceReportConfig.getSitesNoConfig($scope.sitesHasConfig, sites);
                });
        }

        function sitesHasConfigPush(site) {
            $scope.sitesHasConfig.push(site);
            $scope.sitesNoConfig.splice($scope.sitesNoConfig.indexOf(site), 1);
        }

        function sitesHasConfigPushAll(allSites) {
            angular.forEach(allSites, function(site) {
                $scope.sitesHasConfig.push(site);
            });

            $scope.sitesNoConfig = [];
        }

        function sitesHasConfigDrop(site) {
            $scope.sitesNoConfig.push(site);
            $scope.sitesHasConfig.splice($scope.sitesHasConfig.indexOf(site), 1);
        }

        function sitesHasConfigDropAll(allSites) {
            angular.forEach(allSites, function(site) {
                $scope.sitesNoConfig.push(site);
            });

            $scope.sitesHasConfig = [];
        }

        function addEmailInput() {
            var numberEmail = $scope.emailReceive.length+1;
            $scope.emailReceive.push({id : numberEmail})
        }

        function removeEmailInput(email) {
            if($scope.emailReceive.length > 1) {
                $scope.emailReceive.splice($scope.emailReceive.indexOf(email), 1);
            }
        }

        function isFormValid() {
            if($scope.selected.includedAll) {
                return $scope.sourceReportConfig.$valid
            }

            return $scope.sourceReportConfig.$valid && $scope.sitesHasConfig.length > 0;
        }

        function submit() {
            var emails = [];
            var sites = [];

            angular.forEach($scope.emailReceive, function(emailReceive) {
                if(emailReceive.email != null) {
                    emails.push(emailReceive.email);
                }
            });

            if(!$scope.selected.includedAll) {
                angular.forEach($scope.sitesHasConfig, function(site) {
                    if(site.id != null) {
                        sites.push(site.id);
                    }
                });
            }

            var sourceReportConfigPost;

            if($scope.selected.includedAll) {
                sourceReportConfigPost = sourceReportConfig.postEmailIncludedAllConfig(emails, $scope.selected.includedAll);
            }

            else {
                sourceReportConfigPost = sourceReportConfig.postEmailConfig(emails, sites);
            }

            return sourceReportConfigPost
                .then(function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: 'The email config has been updated'
                    });
                })

                .then(function() {
                    $state.reload();
                })

                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'The email config is not updated'
                    });
                })
            ;
        }
    }
})();