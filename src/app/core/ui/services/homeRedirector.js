angular.module('tagcade.core.ui')

    .factory('HomeRedirector', function($state, Auth, USER_ROLES) {
        return {
            redirect: function() {
                var newState;

                if (Auth.isAuthorized(USER_ROLES.admin)) {
                    newState = 'app.admin.dashboard';
                } else if (Auth.isAuthorized(USER_ROLES.publisher)) {
                    newState ='app.publisher.dashboard';
                }

                if (angular.isUndefined(newState)) {
                    return false;
                }

                $state.go(newState);

                return true;
            }
        };
    })

;
