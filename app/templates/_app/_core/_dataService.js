(function(){
    'use strict';

    angular
        .module('app.core')
        .factory('dataService', dataService);

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