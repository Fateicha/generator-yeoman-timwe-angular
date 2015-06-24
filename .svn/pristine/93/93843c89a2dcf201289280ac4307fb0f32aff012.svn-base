/**
 * Created by andre.fatia on 24/03/2015.
 */
(function() {
    'use strict';

    angular
        .module('app.feature')
        .config(route);

    route.$inject = ['$stateProvider'];
    /* @ngInject */
    function route($stateProvider) {
        $stateProvider
            .state('app.feature', {
                url: '/',
                templateUrl: 'app/feature/feature.html',
                controller: 'FeatureController as vm' // https://github.com/driftyco/ionic/issues/3058
            });
    }
})();