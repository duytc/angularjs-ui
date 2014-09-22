angular.module('tagcade.core.ui')

    .constant('BASE_USER_STATES', {
        admin: 'app.admin',
        publisher: 'app.publisher'
    })

    .provider('userStateHelper', function($stateProvider, BASE_USER_STATES) {
        'use strict';

        function getCustomResolve(customResolves, baseName, resolveKey) {
            var resolve;

            try {
                resolve = customResolves[baseName][resolveKey];
            }
            catch (e) {
                resolve = undefined;
            }

            return resolve;
        }

        /**
         * Creates a state for every base user state.
         *
         * i.e a state of tagManagement, creates two states
         * app.admin.tagManagement and app.publisher.tagManagement
         *
         * This means we don't have to duplicate configuration.
         *
         * This always uses UI router's dot notation.
         *
         * If the state definition contains a customResolve parameter, it allows
         * you to create a resolve only for a certain base state, if that custom resolve is not specified
         * for all states, those states will simply return null.
         *
         * @param name
         * @param definition
         * @return this
         */
        this.state = function (name, definition) {
            if (angular.isObject(name)) {
                definition = name;
            }
            else {
                definition.name = name;
            }

            var customResolves = [];

            if (definition.customResolve) {
                angular.forEach(BASE_USER_STATES, function (baseState, baseName) {
                    if (!definition.customResolve[baseName] || !angular.isObject(definition.customResolve[baseName])) {
                        return;
                    }

                    var resolveKeys = Object.keys(definition.customResolve[baseName]);

                    angular.forEach(resolveKeys, function (key) {
                        if (customResolves.indexOf(key) === -1) {
                            customResolves.push(key);
                        }
                    });
                });

                if (customResolves.length && !angular.isObject(definition.resolve)) {
                    definition.resolve = {};
                }
            }

            angular.forEach(BASE_USER_STATES, function (baseState, baseName) {
                var newDefinition = angular.copy(definition);
                newDefinition.name = baseState + '.' + newDefinition.name;

                if (newDefinition.customResolve) {
                    angular.forEach(customResolves, function (resolveKey) {
                        var resolve = getCustomResolve(newDefinition.customResolve, baseName, resolveKey);

                        if (angular.isDefined(resolve)) {
                            newDefinition.resolve[resolveKey] = resolve;
                        } else {
                            newDefinition.resolve[resolveKey] = function () {
                                return null;
                            };
                        }
                    });

                    delete newDefinition.customResolve;
                }

                $stateProvider.state(newDefinition);
            });

            return this;
        };

        this.$get = function($state, $q, Auth, USER_ROLES) {
            return {

                /**
                 * Gets the base state for the currently logged in user
                 *
                 * @returns {null|string}
                 */
                getBaseState: function () {
                    var baseState = null;

                    // todo this should be configured by a provider instead of hard coded
                    if (Auth.isAuthorized(USER_ROLES.admin)) {
                        baseState = BASE_USER_STATES.admin;
                    } else if (Auth.isAuthorized(USER_ROLES.publisher)) {
                        baseState = BASE_USER_STATES.publisher;
                    }

                    return baseState;
                },

                /**
                 * Transition to a new state relative to the base state (different for different user roles)
                 *
                 * For example, if the user is logged in as an admin and you pass in 'error.404' as the 'to' parameter
                 * The user is redirected to app.admin.error.404
                 *
                 * @param {string} to i.e .error.404
                 * @param {object} [toParams]
                 * @param {object} [options]
                 * @returns {Promise}
                 */
                transitionRelativeToBaseState: function (to, toParams, options) {
                    options = options || {};

                    var baseStateName = this.getBaseState();

                    if (!baseStateName) {
                        // User is probably not logged in
                        return $q.reject('no base state set');
                    }

                    var baseState = $state.get(baseStateName);

                    if (!baseState) {
                        return $q.reject('the base state was not found');
                    }

                    if (to.indexOf('.') !== 0) {
                        // ensure the to state starts with a period
                        to = '.' + to;
                    }

                    options = angular.extend(options, { relative: baseState });

                    return $state.transitionTo(to, toParams, options);
                }

            };
        };
    })

;
