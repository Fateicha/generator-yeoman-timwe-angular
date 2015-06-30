(function() {
    'use strict';

    angular
        .module('app.layout')
        .config(route);

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
    }
})();