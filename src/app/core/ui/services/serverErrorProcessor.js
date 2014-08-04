angular.module('tagcade.core.ui')

    .factory('ServerErrorProcessor', function ($q, AlertService) {
        'use strict';

        // reformat error property if it exists
        // the default format returned by the symfony2 API is simplified here
        function formatServerErrors(serverErrors) {
            var errors = {};

            if (!serverErrors.hasOwnProperty('children')) {
                return errors;
            }

            angular.forEach(serverErrors.children, function (fieldErrors, fieldName) {
                if (!fieldErrors.hasOwnProperty('errors')) {
                    return;
                }

                errors[fieldName] = [];

                angular.forEach(fieldErrors.errors, function (error) {
                    errors[fieldName].push(error);
                });
            });

            return errors;
        }

        return {
            /**
             *
             * @param {object} response response from restangular
             * @param form An angular FormController
             * @param {object} fieldNameTranslations
             * @returns {Promise}
             */
            setFormValidationErrors:  function (response, form, fieldNameTranslations) {
                var errors;

                try {
                    errors = response.data.errors;
                } catch (e) {}

                if (response.status !== 400 || !angular.isObject(errors)) {
                    return $q.reject('invalid request');
                }

                errors = formatServerErrors(errors);

                if (Object.keys(errors).length === 0) {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'An unknown server error occurred'
                    });

                    return $q.reject('invalid form but no errors returned from server');
                }

                if (angular.isDefined(fieldNameTranslations) && !angular.isObject(fieldNameTranslations)) {
                    throw new Error('fieldNameTranslations should be an object')
                }

                fieldNameTranslations = fieldNameTranslations || {};

                AlertService.clearAll();

                angular.forEach(errors, function (errorMessage, fieldName) {
                    if (!form.hasOwnProperty(fieldName)) {
                        return;
                    }

                    // todo check if form is actually a FormController
                    form[fieldName].$setValidity('server', false);

                    var humanFieldName = fieldName;

                    if (fieldNameTranslations.hasOwnProperty(fieldName)) {
                        humanFieldName = fieldNameTranslations[fieldName];
                    }

                    AlertService.addAlert({
                        type: 'error',
                        title: humanFieldName + ' error',
                        message: errorMessage
                    });
                });

                return $q.reject('invalid form');
            }
        };
    })

;