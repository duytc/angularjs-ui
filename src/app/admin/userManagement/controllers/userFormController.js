angular.module('tagcade.admin.userManagement')

    .controller('AdminUserFormController', function ($scope, $state, $q, AdminUserManager, AlertService, user) {
        'use strict';

        $scope.isNew = user === null;

        $scope.user = user || {
            username: null,
            email: null,
            userRoles: [],
            enabledModules: [],
            enabled: true,
            lastLogin: null
        };

        $scope.userRoles = [
            { label: 'Publisher', role: 'ROLE_PUBLISHER' },
            { label: 'Admin', role: 'ROLE_ADMIN' }
        ];

        $scope.modules = [
            { label: 'Display', role: 'MODULE_DISPLAY' },
            { label: 'Video', role: 'MODULE_VIDEO' },
            { label: 'Analytics', role: 'MODULE_ANALYTICS' },
            { label: 'Fraud Detection', role: 'MODULE_FRAUD_DETECTION' }
        ];

        function isValidRole(role) {
            return role && angular.isString(role);
        }

        $scope.hasUserRole = function (role) {
            return $scope.user.userRoles.indexOf(role) > -1;
        };

        $scope.setUserRole = function (role) {
            if (!isValidRole(role)) {
                return;
            }

            // remove all current roles that start with ROLE_
            $scope.user.userRoles = $scope.user.userRoles.filter(function (role) {
                return role.indexOf('ROLE_') !== 0;
            });

            // replace with new role at beginning
            $scope.user.userRoles.unshift(role);
        };

        $scope.hasModuleEnabled = function (role) {
            return $scope.user.enabledModules.indexOf(role) > -1;
        };

        $scope.toggleModuleRole = function (role) {
            // module permission is really just a role
            if (!isValidRole(role)) {
                return;
            }

            var idx = $scope.user.enabledModules.indexOf(role);

            if (idx > -1) {
                $scope.user.enabledModules.splice(idx, 1);
            } else {
                $scope.user.enabledModules.push(role);
            }
        };

        $scope.isFormValid = function() {
            return $scope.user.userRoles.length > 0 && $scope.userForm.$valid;
        };

        $scope.submit = function() {
            var saveUser = $scope.isNew ? AdminUserManager.post($scope.user) : $scope.user.patch();

            saveUser
                .catch(function (response) {
                    if (response.status === 400 && angular.isObject(response.data) && response.data.hasOwnProperty('errors')) {
                        angular.forEach(response.data.errors.children, function (fieldErrors, fieldName) {
                            if (!fieldErrors.hasOwnProperty('errors')) {
                                return;
                            }

                            angular.forEach(fieldErrors.errors, function (error) {
                               console.log(fieldName, error);
                            });
                        });

                        return $q.reject('invalid form');
                    }

                    return $q.reject('invalid request');
                })
                .then(
                    function () {
                        AlertService.addFlash('success', 'The user has been updated');
                    }
                )
                .then(
                    function () {
                        return $state.go('^.list');
                    }
                )
            ;
        };
    })

;