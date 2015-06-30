(function(){
    'use strict';

    angular
        .module('app.feature')
        .controller('FeatureController', FeatureController);

    /* @ngInject */
    function FeatureController() {
        /* jshint validthis: true */
        var vm = this;

        activate();

        ////////////////

        function activate() {
            vm.title = "Feature";
        }
    }
})();