angular.module('tagcade.core.ui')

    .factory('ServerErrorProcessor', function ($q, AlertService) {
        'use strict';

        return {
            /**
             *
             * @param {object} response response from restangular
             * @param form An angular FormController
             * @param {object} fieldNameTranslations
             * @returns {Promise}
             */
            process:  function (response, form, fieldNameTranslations) {
                var errors;

                try {
                    errors = response.data.errors;
                } catch (e) {}

                if (response.status !== 400 || !angular.isObject(errors)) {
                    return $q.reject('invalid request');
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