(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSourceFile')
        .controller('uploadFileForm', uploadFileForm);

    function uploadFileForm($scope, $stateParams, dataSource, dataSources, FileUploader, sessionStorage, UnifiedReportDataSourceManager, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.dataSourceEntry = {
            dataSource: dataSource || null
        };

        $scope.dataSources = dataSources || null;
        $scope.formProcessing = false;

        $scope.isFormValid = isFormValid;
        $scope.selectDataSource = selectDataSource;

        var baseUploadURL = UnifiedReportDataSourceManager.one().getRestangularUrl() + '/%dataSourceId%/uploads';

        // var dropUploader = $scope.dropUploader = new FileUploader({
        //     url: dataSource ? baseUploadURL.replace('%dataSourceId%', dataSource.id) : baseUploadURL,
        //     headers: {
        //         Authorization: 'Bearer ' + sessionStorage.getCurrentToken()
        //     }
        // });

        var uploader = $scope.uploader = new FileUploader({
            url: dataSource ? baseUploadURL.replace('%dataSourceId%', dataSource.id) : baseUploadURL,
            // autoUpload: true,
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getCurrentToken()
            }
        });

        function selectDataSource(dataSource) {
            uploader.url = baseUploadURL.replace('%dataSourceId%', dataSource.id);
            // dropUploader.url = baseUploadURL.replace('%dataSourceId%', dataSource.id);
        }

        function isFormValid() {
            return $scope.userForm.$valid;
        }

        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/ , options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                var extension = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';

                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|json|csv|'.indexOf(type) !== -1 || '|xls|xlsx|json|csv|'.indexOf(extension) !== -1;
            }
        });

        uploader.onErrorItem = function(fileItem, response, status, headers) {
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

        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            angular.forEach(response, function (re) {
                AlertService.addFlash({
                    type: re.status ? 'success' : 'error',
                    message: re.message
                });
            })
        };

        uploader.uploadAllDataSource = function() {
            angular.forEach(uploader.queue, function (elem) {
                elem.url = uploader.url;
            });

            uploader.uploadAll();
        };

        uploader.onCompleteAll = function() {
            // AlertService.addFlash({
            //     type: 'success',
            //     message: $translate.instant('UNIFIED_REPORT_DATA_SOURCE_ENTRY_MODULE.UPLOAD_FILES_SUCCESS')
            // });

            if($stateParams.dataSourceId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSourceFile, '^.listForDataSource', {dataSourceId: $stateParams.dataSourceId});
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSourceFile, '^.list');
        };

        /// drop

        // dropUploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item /*{File|FileLikeObject}*/ , options) {
        //         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        //         var extension = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';
        //
        //         return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|json|csv|'.indexOf(type) !== -1 || '|xls|xlsx|json|csv|'.indexOf(extension) !== -1;
        //     }
        // });
        //
        // dropUploader.onErrorItem = function(fileItem, response, status, headers) {
        //     AlertService.addFlash({
        //         type: 'error',
        //         message: "Upload file '" + fileItem.file.name + "' fail"
        //     });
        // };
        //
        // dropUploader.onSuccessItem = function(fileItem, response, status, headers) {
        //     AlertService.addFlash({
        //         type: 'success',
        //         message: "Upload file '"+ fileItem.file.name + "' success"
        //     });
        // };
        //
        // dropUploader.uploadAllDataSource = function() {
        //     angular.forEach(dropUploader.queue, function (elem) {
        //         elem.url = dropUploader.url;
        //     });
        //
        //     dropUploader.uploadAll();
        // };
        //
        // dropUploader.onCompleteAll = function() {
        //     // AlertService.addFlash({
        //     //     type: 'success',
        //     //     message: $translate.instant('UNIFIED_REPORT_DATA_SOURCE_ENTRY_MODULE.UPLOAD_FILES_SUCCESS')
        //     // });
        //
        //     if($stateParams.dataSourceId) {
        //         return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSourceFile, '^.listForDataSource', {dataSourceId: $stateParams.dataSourceId});
        //     }
        //
        //     return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSourceFile, '^.list');
        // };
    }
})();