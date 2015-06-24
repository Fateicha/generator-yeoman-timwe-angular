(function(){
    'use strict';

    angular
        .module('app.layout')
        .controller('ShellController', ShellController);

    /* @ngInject */
    function ShellController() {
        /* jshint validthis: true */
        var vm = this;

        activated();

        function activated(){}
    }

})();