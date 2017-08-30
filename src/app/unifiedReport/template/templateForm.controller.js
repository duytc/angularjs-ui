(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.template')
        .controller('TemplateForm', TemplateForm);

    function TemplateForm($scope, UnifiedReportViewManager, reportViewList, template, tags, publishers,  AlertService, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            reportView: 'Report View',
            tag: 'tag'
        };

        $scope.reportViewList = reportViewList;
        $scope.publishers = publishers;
        $scope.tags = tags;

        $scope.isNew = template === null;

        $scope.template = template || {
            name: null,
            reportView: null,
            tags: [],
            userTags: []
        };

        if(!$scope.isNew) {
            var tags = [];

            angular.forEach($scope.template.reportViewTemplateTags, function (tag) {
                tags.push(tag.tag)
            });

            $scope.template.tags = tags;
        }
        
        $scope.backToTemplateList = backToTemplateList;
        
        function backToTemplateList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.template, '^.list');
        }

        $scope.isFormValid = function () {
            return $scope.createTemplate.$valid
        };

        $scope.addTag = function (query) {
            return {
                name: query
            }
        };

        $scope.submit = function () {
            var template = angular.copy($scope.template);
            var tags = [];

            angular.forEach($scope.template.tags, function (tag) {
                tags.push(tag.name);
            });

            var saveReportView = $scope.isNew ? UnifiedReportViewManager.one(template.reportView).one('reportviewtemplates').post(null, {name: template.name, tags: tags}) : template.patch({name: template.name, tags: tags});

            saveReportView
                .catch(
                    function (response) {
                        $scope.formProcessing = false;

                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.createTemplate, $scope.fieldNameTranslations);

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The report template has been created'
                        });

                        backToTemplateList();
                    }
                )
            ;
        }
    }
})();