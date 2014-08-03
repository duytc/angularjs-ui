angular.module('tagcade.core.ui')

    .factory('UserStateHelper', function($state, $q, Auth, USER_ROLES) {
        'use strict';

        return {
            /**
             * Gets the base state for the currently logged in user
             *
             * @returns {null|string}
             */
            getBaseState: function() {
                var baseState = null;

                // todo this should be configured by a provider instead of hard coded
                if (Auth.isAuthorized(USER_ROLES.admin)) {
                    baseState = 'app.admin';
                } else if (Auth.isAuthorized(USER_ROLES.publisher)) {
                    baseState = 'app.publisher';
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
             * @returns {promise}
             */
            transitionRelativeToBaseState: function(to, toParams) {
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

                return $state.transitionTo(to, toParams, { relative: baseState });
            }
        };
    })

;
