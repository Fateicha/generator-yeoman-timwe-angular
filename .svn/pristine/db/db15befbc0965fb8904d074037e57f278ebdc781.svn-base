/**
 * Created by andre.fatia on 19/03/2015.
 */
(function(){
    'use strict';

    angular
        .module('app.core')
        .factory('dataService', dataService);

    dataService.$inject = ['$http'];
    /* @ngInject */
    function dataService($http) {
        return {
            getSomething: getSomething
        };

        ////////////////

        function getSomething(){
            return $http.get('http://google.com')
                .then(function(response){
                    return response;
                })
                .catch(function(response){
                    return response;
                })
        }

    }
})();