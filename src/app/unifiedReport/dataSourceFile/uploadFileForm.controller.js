(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSourceFile')
        .controller('uploadFileForm', uploadFileForm);

    function uploadFileForm($scope, dataSource, dataSources, DateFormatter, FileUploader, sessionStorage, UnifiedReportDataSourceManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.dataSourceEntry = {
            dataSource: dataSource || null
        };

        $scope.dataSources = dataSources || null;
        $scope.formProcessing = false;
        $scope.metadataKeys = [
            {key: 'date', label: 'Date'},
            {key: 'from', label: 'Email From'},
            {key: 'body', label: 'Email Body'},
            {key: 'subject', label: 'Email Subject'},
            {key: 'filename', label: 'Email Filename '},
            {key: 'dateTime', label: 'Email Received Date '}
        ];

        $scope.parent = {uploadDate: ''};

        var baseUploadURL = UnifiedReportDataSourceManager.one().getRestangularUrl() + '/%dataSourceId%/uploads';

        var uploader = $scope.uploader = new FileUploader({
            url: dataSource ? baseUploadURL.replace('%dataSourceId%', dataSource.id) : baseUploadURL,
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getCurrentToken()
            }
        });

        $scope.datePickerOpts = {
            singleDatePicker: true
        };

        $scope.isFormValid = isFormValid;
        $scope.selectDataSource = selectDataSource;
        $scope.addMetadata = addMetadata;
        $scope.removeParams = removeParams;
        $scope.filterMetadataKeys = filterMetadataKeys;

        function filterMetadataKeys(paramKey, itemMetadata) {
            return function (param) {
                if (param.key == paramKey) {
                    return true
                }

                for (var index in itemMetadata) {
                    if (itemMetadata[index].key == param.key) {
                        return false
                    }
                }

                return true
            }
        }

        function addMetadata(item) {
            item.metadata = item.metadata || [];

            item.metadata.push({key: null, value: null});
        }

        function removeParams(item, index) {
            item.metadata.splice(index, 1);
        }

        function selectDataSource(dataSource) {
            uploader.url = baseUploadURL.replace('%dataSourceId%', dataSource.id);
        }

        function isFormValid() {
            return $scope.userForm.$valid;
        }

        uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                var extension = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';

                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|json|csv|'.indexOf(type) !== -1 || '|xls|xlsx|json|csv|'.indexOf(extension) !== -1;
            }
        });

        uploader.onErrorItem = function (fileItem, response, status, headers) {
            if (status == 413) {
                AlertService.addFlash({
                    type: 'error',
                    message: "'" + fileItem.file.name + "' could not be uploaded because the file is too large"
                });
            } else {
                AlertService.addFlash({
                    type: '',
                    message: response.message || "'" + fileItem.file.name + "' could not be uploaded because the file is in the wrong format"
                });
            }
        };

        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            angular.forEach(response, function (re) {
                AlertService.addFlash({
                    type: re.status ? 'success' : 'error',
                    message: re.message
                });
            });
        };

        uploader.uploadAllDataSource = function() {
            angular.forEach(uploader.queue, function (elem) {
                elem.url = uploader.url;

                var metadata = {};
                angular.forEach(elem.metadata, function (item) {
                    if (item.key == 'date' || item.key == 'dateTime') {
                        //item.value = !!item.value ? DateFormatter.getFormattedDate(item.value.date) : item.value;
                        item.value = $scope.parent.uploadDate
                    }

                    if (!!item.value) {
                        metadata[item.key] = item.value;
                    }
                });

                elem.formData = [{metadata: angular.toJson(metadata)}];
            });

            uploader.uploadAll();
        };

        uploader.onCompleteAll = function () {
            var dataSource = _.find(dataSources, {id: $scope.dataSourceEntry.dataSource});

            if (!!dataSource && dataSource.dateRangeDetectionEnabled) {
                AlertService.addFlash({
                    type: 'warning',
                    message: 'The detected dates may not be updated immediately. Please refresh to get updated'
                });
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSourceFile, '^.listForDataSource', {dataSourceId: $scope.dataSourceEntry.dataSource.id || $scope.dataSourceEntry.dataSource});
        };
    }
})();