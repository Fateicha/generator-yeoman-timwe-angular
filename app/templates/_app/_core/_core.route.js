/**
 * Created by andre.fatia on 19/03/2015.
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .config(route);

    route.$inject = ['$urlRouterProvider', '$stateProvider'];
    /* @ngInject */
    function route($urlRouterProvider, $stateProvider) {
        $urlRouterProvider
            .when('', '/')
            .otherwise('/');

        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'app/layout/shell.html',
                controller: 'ShellController as vm'
            });
        
        $stateProvider
            .state('error', {
                templateUrl: 'app/layout/error.html',
                title: 'BAD CONNECTION'
            });

    }
})();