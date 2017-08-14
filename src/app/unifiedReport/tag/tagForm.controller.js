(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.tag')
        .controller('TagForm', TagForm);

    function TagForm($scope, UnifiedReportTagManager, tag, publishers, integrations, templates, AlertService, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = tag === null;

        $scope.publishers = publishers;
        $scope.templates = templates;
        $scope.integrations = integrations;

        $scope.tag = tag || {
                name: null,
                userTags: [],
                reportViewTemplateTags: [],
                integrationTags: []
            };

        if(!$scope.isNew) {
            var userTags = [];
            var reportViewTemplateTags = [];
            var integrationTags = [];

            angular.forEach($scope.tag.userTags, function (pub) {
                userTags.push(pub.publisher.id)
            });

            angular.forEach($scope.tag.reportViewTemplateTags, function (template) {
                reportViewTemplateTags.push(template.reportViewTemplate.id)
            });

            angular.forEach($scope.tag.integrationTags, function (integration) {
                integrationTags.push(integration.integration.id)
            });

            $scope.tag.userTags = userTags;
            $scope.tag.reportViewTemplateTags = reportViewTemplateTags;
            $scope.tag.integrationTags = integrationTags;
        }

        $scope.backToTagList = backToTagList;

        function backToTagList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.tag, '^.list');
        }

        $scope.isFormValid = function () {
            return $scope.createTag.$valid
        };

        $scope.addTag = function (query) {
            return query
        };

        $scope.submit = function () {
            var tag = angular.copy($scope.tag);
            var userTags = [];
            var reportViewTemplateTags = [];
            var integrationTags = [];

            angular.forEach(tag.userTags, function (pub) {
                userTags.push({publisher: pub})
            });

            angular.forEach(tag.reportViewTemplateTags, function (template) {
                reportViewTemplateTags.push({reportViewTemplate: template})
            });

            angular.forEach(tag.integrationTags, function (integration) {
                integrationTags.push({integration: integration})
            });

            tag.userTags = userTags;
            tag.reportViewTemplateTags = reportViewTemplateTags;
            tag.integrationTags = integrationTags;

            var saveTag = $scope.isNew ? UnifiedReportTagManager.post(tag) : UnifiedReportTagManager.one(tag.id).patch(tag);

            saveTag
                .catch(
                    function (response) {
                        $scope.formProcessing = false;

                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.createTag, $scope.fieldNameTranslations);

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? 'The tag has been created' : 'The tag has been updated'
                        });

                        backToTagList()
                    }
                )
            ;
        }
    }
})();