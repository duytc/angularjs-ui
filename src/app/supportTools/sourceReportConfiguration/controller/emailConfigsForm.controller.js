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
            includedAll: false,
            listPush: [],
            listDrop: []
        };

        $scope.addEmailInput = addEmailInput;
        $scope.removeEmailInput = removeEmailInput;
        $scope.selectPublisher = selectPublisher;
        $scope.sitesHasConfigPush = sitesHasConfigPush;
        $scope.sitesHasConfigPushAll = sitesHasConfigPushAll;
        $scope.sitesHasConfigDrop = sitesHasConfigDrop;
        $scope.sitesHasConfigDropAll = sitesHasConfigDropAll;
        $scope.sitesHasConfigPushItems = sitesHasConfigPushItems;
        $scope.sitesHasConfigDropItems = sitesHasConfigDropItems;
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
            _clearSelectMultiple();
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
            _clearSelectMultiple();
        }

        function sitesHasConfigDropAll(allSites) {
            angular.forEach(allSites, function(site) {
                $scope.sitesNoConfig.push(site);
            });

            $scope.sitesHasConfig = [];
        }

        function sitesHasConfigPushItems(items) {
            var sitesConfigId = [];
            var sitesNoConfig = [];

            angular.forEach($scope.sitesNoConfig, function(site) {
                angular.forEach(items, function(item) {
                    var item = angular.fromJson(item);
                    if(item.id == site.id) {
                        $scope.sitesHasConfig.push(site);
                        sitesConfigId.push(site.id);
                    }
                });

                if(sitesConfigId.indexOf(site.id) == -1) {
                    sitesNoConfig.push(site);
                }
            });

            _clearSelectMultiple();
            return $scope.sitesNoConfig = sitesNoConfig;
        }

        function sitesHasConfigDropItems(items) {
            var sitesConfigId = [];
            var sitesHasConfig = [];

            angular.forEach($scope.sitesHasConfig, function(site) {
                angular.forEach(items, function(item) {
                    var item = angular.fromJson(item);
                    if(item.id == site.id) {
                        $scope.sitesNoConfig.push(site);
                        sitesConfigId.push(site.id);
                    }
                });

                if(sitesConfigId.indexOf(site.id) == -1) {
                    sitesHasConfig.push(site);
                }
            });

            _clearSelectMultiple();
            return $scope.sitesHasConfig = sitesHasConfig;
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
                    $state.go($state.current, {uniqueRequestCacheBuster: Math.random()});
                })

                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'The email config is not updated'
                    });
                })
            ;
        }

        function _clearSelectMultiple() {
            $scope.selected.listPush = null;
            $scope.selected.listDrop = null;
        }
    }
})();