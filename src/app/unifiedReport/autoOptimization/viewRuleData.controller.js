(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimization')
        .controller('ViewRuleData', ViewRuleData);

    function ViewRuleData($scope, optimizeRule, $stateParams, _, $translate, AlertService, DateFormatter,
                          AutoOptimizationManager, OptimizationUtil) {

        const IDENTIFIER_LABEL = 'identifier';
        const OVERALL_SCORE_LABEL = 'score';
        const DATE_LABEL = 'date';

        $scope.optimizeRule = optimizeRule.plain();
        /**
         * data to fill to html form
         * @type {{dimensions: Array, metrics: Array}}
         */
        $scope.formData = {
            dimensions: [],
            metrics: [],
            dateRange: null,
            optimizeFields: [],
            segmentFields: [],
            segmentOptionsData: [],
            countries: [
                {name: 'Afghanistan', code: 'AF'},
                {name: 'Åland Islands', code: 'AX'},
                {name: 'Albania', code: 'AL'},
                {name: 'Algeria', code: 'DZ'},
                {name: 'American Samoa', code: 'AS'}
            ],
            viewRuleData: [],
            viewRulePageData: [],
            columnsData: [],
            columnSortTypes: [],
            fieldNameWithDataSet: []
        };
        /**
         * data that user customizes
         * @type {{dimensions: Array, metrics: Array}}
         */
        $scope.currentModel = {
            dimensions: [],
            metrics: [],
            dateRange: {
                startDate: moment(),
                endDate: moment()
            },
            selectedStartDate: '',
            selectedEndDate: '',
            optimizeFields: [],
            segmentFields: [],
            segmentChild: {},
            country: null
        };
        $scope.currentModel.dateRange.startDate._isValid = true;
        $scope.currentModel.dateRange.endDate._isValid = true;

        $scope.datePickerOpts = {
            // singleDatePicker: true,
            showDropdowns: true,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: 0
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '30', key: '30'},
            {label: '40', key: '40'},
            {label: '50', key: '50'}
        ];

        $scope.hasFilterDate = hasFilterDate;
        $scope.extractDimensionsFromIdentifiersAndSegments = extractDimensionsFromIdentifiersAndSegments;
        $scope.extractMetricsFromOptimizeFields = extractMetricsFromOptimizeFields;
        $scope.initData = initData;
        $scope.buildOptimizeFieldsFormData = buildOptimizeFieldsFormData;
        $scope.buildSegmentFieldsFormData = buildSegmentFieldsFormData;
        $scope.buildCountriesFormData = buildCountriesFormData;
        $scope.getFormDataBySegment = getFormDataBySegment;
        $scope.onDateApply = onDateApply;
        $scope.onViewRuleData = onViewRuleData;
        $scope.prepareApiParam = prepareApiParam;
        $scope.disableViewRuleData = disableViewRuleData;
        $scope.showPagination = showPagination;
        $scope.changePage = changePage;
        $scope.sort = sort;
        $scope.onChangeSegments = onChangeSegments;
        $scope.getNgModelBySegment = getNgModelForChildSegment;
        $scope.onChildSegmentSelect = onChildSegmentSelect;
        $scope.resetChildSegments = resetChildSegments;
        $scope.resetSortStatus = resetSortStatus;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.customColumnsLabel = customColumnsLabel;
        $scope.resetFormOnView = resetFormOnView;
        $scope.hasData = function () {
            return !!$scope.formData.columnsData.length;
        };
        $scope.initData();

        /**
         * generate label for columns
         * @param columnData
         */
        function customColumnsLabel(columnData) {
            angular.forEach(columnData, function (column) {
                if (column.field === IDENTIFIER_LABEL || column.field === DATE_LABEL) {
                    column.label = column.field;
                } else if (column.field === OVERALL_SCORE_LABEL) {
                    column.label = $translate.instant("AUTO_OPTIMIZE_INTEGRATION_MODULE.OVERALL_SCORE_LABEL");
                } else {
                    var original = column.field;
                    var notFieldInDataSet = isNotFieldInDataSet(original, $scope.optimizeRule.reportView);
                    if (!notFieldInDataSet) {
                        var array = original.split("_");
                        array.splice(-1, 1); //remove last index
                        column.label = array.join(" ");
                    } else {
                        column.label = column.field;
                    }
                }
            });

            /*remove identiferField && re-sort identifields items*/
            var identifierRef = $scope.optimizeRule.identifierFields || [];
            columnData.map(function(item, index){
                if(item.field === IDENTIFIER_LABEL)
                    columnData.splice(index, 1);

                if(_.contains(identifierRef, item.field)) {
                    columnData.splice(index, 1);
                    columnData.splice(_.first(identifierRef) === item.field ? 1 : 2, 0, item);
                }
            })
        }

        function selectItemPerPages(page) {
            $scope.resetSortStatus();
            $scope.tableConfig.itemsPerPage = Number(page.label);
            $scope.availableOptions.pageSize = Number(page.label);
            $scope.availableOptions.currentPage = 1;
            $scope.changePage($scope.availableOptions.currentPage);
        }

        function resetChildSegments() {
            angular.forEach($scope.currentModel.segmentFields, function (segment) {
                segment.selected = null;
            })
        }

        function onChildSegmentSelect(segment, selectedChildValue) {
            $scope.currentModel.segmentChild[segment.name] = selectedChildValue;
            segment.selected = selectedChildValue;
        }

        function onChangeSegments(clickedSegment) {
            if (!clickedSegment.ticked) {
                $scope.currentModel.segmentChild[clickedSegment.name] = null;
            }

            angular.forEach($scope.currentModel.segmentFields, function (segment) {
                segment.selected = $scope.currentModel.segmentChild[segment.name];
            })
        }


        function resetSortStatus() {
            angular.forEach($scope.formData.columnsData, function (column) {
                $scope.formData.columnSortTypes[column.field] = OptimizationUtil.NONE;
            });

        }

        function sort(columnName) {
            var type = OptimizationUtil.toggleSort($scope.formData.columnSortTypes[columnName]);
            $scope.resetSortStatus();
            var sortedData = angular.copy($scope.formData.viewRuleData);
            sortedData.sort(OptimizationUtil.compareValues(columnName, type));
            $scope.formData.columnSortTypes[columnName] = type;

            $scope.formData.viewRuleData = angular.copy(sortedData);
            $scope.changePage($scope.availableOptions.currentPage);
        }

        function changePage(currentPage) {
            var pageData = angular.copy($scope.formData.viewRuleData);
            if (!pageData)
                return;

            var startIndex = (currentPage - 1) * $scope.tableConfig.itemsPerPage;
            var size = $scope.tableConfig.itemsPerPage;
            var pageDataNew = pageData.slice(startIndex, size + startIndex);
            $scope.formData.viewRulePageData = pageDataNew;
            $scope.tableConfig.totalItems = pageData.length;
        }

        function showPagination() {
            return angular.isArray($scope.formData.viewRuleData)
                && $scope.formData.viewRuleData
                && $scope.formData.viewRuleData.length > $scope.tableConfig.itemsPerPage;
        }

        function disableViewRuleData() {
            if (($scope.currentModel.selectedStartDate == null || $scope.currentModel.selectedStartDate == '')) {
                return true;
            }
            for (var index in $scope.currentModel.segmentFields) {
                var segment = $scope.currentModel.segmentFields[index];
                var selected = $scope.currentModel.segmentFields[index].selected;
                var options = $scope.getFormDataBySegment(segment);
                if ((options != null && options.length != 0 && !selected)) {
                    return true;
                }
            }
            return false;
        }

        function prepareApiParam() {
            var segmentFieldValues = {};
            angular.forEach($scope.currentModel.segmentFields, function (segment) {
                segmentFieldValues[segment.name] = segment.selected;
            });
            return {
                "optimizationRuleId": $scope.optimizeRule.id,
                "startDate": $scope.currentModel.selectedStartDate,
                "endDate": $scope.currentModel.selectedEndDate,
                "segmentFieldValues": segmentFieldValues
            };
        }

        function resetFormOnView() {
            $scope.formData.viewRuleData = [];
            $scope.formData.columnsData = [];
            $scope.availableOptions.currentPage = 1;
            $scope.tableConfig.totalItems = 0
        }

        /**
         * call api to get rule data
         */
        function onViewRuleData() {
            $scope.resetFormOnView();

            var param = $scope.prepareApiParam();

            if (!$scope.formProcessing) {
                $scope.formProcessing = true;
            }

            AutoOptimizationManager.one($scope.optimizeRule.id).post('data', param)
                .then(function (segmentOptions) {
                    var dataFromApi = segmentOptions.plain();

                    if (dataFromApi == null || dataFromApi.length == 0) {
                        AlertService.replaceAlerts({
                            type: 'warning',
                            message: $translate.instant("AUTO_OPTIMIZE_INTEGRATION_MODULE.EMPTY_RULE_DATA")
                        });
                    } else {
                        AlertService.removeAlert();
                    }
                    $scope.formData.viewRuleData = dataFromApi.rows;

                    angular.forEach(dataFromApi.columns, function (column) {
                        var json = {
                            field: column,
                            label: column
                        };

                        if (column != 'identifier' ) {
                            $scope.formData.columnsData.push(json);
                        }
                    });
                    $scope.customColumnsLabel($scope.formData.columnsData);

                    angular.forEach($scope.formData.columnsData, function (column) {
                        $scope.formData.columnSortTypes[column.field] = OptimizationUtil.NONE;
                    });

                    $scope.availableOptions.currentPage = 1;
                    $scope.changePage($scope.availableOptions.currentPage);
                    $scope.formProcessing = false;
                }, function (error) {
                    $scope.formProcessing = false;
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: error.data.message
                    });
                });

        }

        /**
         * action when date range change. call api to get new data (US UK...) for segments (country, domain ...)
         */
        function onDateApply() {
            $scope.resetChildSegments();
            var startDate = $scope.currentModel.dateRange == null ? null : $scope.currentModel.dateRange.startDate;
            var endDate = $scope.currentModel.dateRange == null ? null : $scope.currentModel.dateRange.endDate;
            if (!startDate || !startDate._isValid) {
                $scope.currentModel.selectedStartDate = null;
                return;
            }
            if (!endDate || !endDate._isValid) {
                $scope.currentModel.selectedEndDate = null;
                return;
            }
            $scope.currentModel.selectedStartDate = DateFormatter.getFormattedDate(startDate);
            $scope.currentModel.selectedEndDate = DateFormatter.getFormattedDate(endDate);
            var param = {
                "searchField": $scope.optimizeRule.dateField,
                "startDate": $scope.currentModel.selectedStartDate,
                "endDate": $scope.currentModel.selectedEndDate
            };
            AutoOptimizationManager.one($scope.optimizeRule.id).one('segments').get(param)
                .then(function (segmentOptions) {
                    $scope.formData.segmentOptionsData = segmentOptions.plain();
                    angular.forEach($scope.formData.segmentFields, function (segment) {
                        $scope.currentModel.segmentChild[segment.name] = null;
                    });
                });
        }

        function getNgModelForChildSegment(segment) {
            return $scope.currentModel.segmentChild[segment];
        }

        function initData() {
            $scope.formData.fieldNameWithDataSet = OptimizationUtil.buildFieldsName($scope.optimizeRule.reportView);
            $scope.onDateApply();
            $scope.formData.dimensions = $scope.extractDimensionsFromIdentifiersAndSegments();
            $scope.formData.metrics = $scope.extractMetricsFromOptimizeFields();
            $scope.formData.optimizeFields = $scope.buildOptimizeFieldsFormData();
            $scope.formData.segmentFields = $scope.buildSegmentFieldsFormData();

            $scope.onViewRuleData();
        }

        function getFormDataBySegment(segment) {
            var key = segment.name;
            var options = $scope.formData.segmentOptionsData[key] || [];
            return options;
        }

        function hasFilterDate() {
            return true;
        }

        function buildCountriesFormData() {

        }

        function isNotFieldInDataSet(field, reportView) {
            return OptimizationUtil.isJoinField(field, reportView) || !$scope.formData.fieldNameWithDataSet[field];
        }

        function buildSegmentFieldsFormData() {
            var segmentObjects = [];
            var reportView = $scope.optimizeRule.reportView;
            angular.forEach($scope.optimizeRule.segmentFields, function (segment) {
                var NotFieldInDataSet = isNotFieldInDataSet(segment, reportView);
                var label = NotFieldInDataSet ?
                    segment :
                    $scope.formData.fieldNameWithDataSet[segment];
                var plainLabel = NotFieldInDataSet ? segment : OptimizationUtil.removeDataSetId(segment);
                var json = {
                    label: label,
                    name: segment,
                    plainName: plainLabel,
                    ticked: false,
                    selected: null
                };
                segmentObjects.push(json)
            });
            return segmentObjects ? segmentObjects : [];
        }

        function buildOptimizeFieldsFormData() {
            var optimizeFieldsFormData = angular.copy($scope.optimizeRule.optimizeFields);
            angular.forEach(optimizeFieldsFormData, function (optimizeField) {
                optimizeField.label = optimizeField.field;
                optimizeField.name = optimizeField.field;
                optimizeField.ticked = false;
            });
            return optimizeFieldsFormData;
        }

        /**
         * prepare data for dimensions multi select
         * @returns {Array}
         */
        function extractDimensionsFromIdentifiersAndSegments() {
            var dimensions = _.union($scope.optimizeRule.identifierFields, $scope.optimizeRule.segmentFields);

            var dimensionObjects = [];
            angular.forEach(dimensions, function (dimension) {
                var json = {
                    label: dimension,
                    name: dimension,
                    ticked: false
                };
                dimensionObjects.push(json)
            });
            return dimensionObjects ? dimensionObjects : [];
        }

        /**
         * prepare data for metrics multi select
         * @returns {Array}
         */
        function extractMetricsFromOptimizeFields() {
            var optimizeRules = $scope.optimizeRule.optimizeFields;
            var metricsObjects = [];
            angular.forEach(optimizeRules, function (optimizeRule) {
                var json = {
                    label: optimizeRule.field,
                    name: optimizeRule.field,
                    ticked: false
                };
                metricsObjects.push(json)
            });
            return metricsObjects ? metricsObjects : [];
        }
    }
})();