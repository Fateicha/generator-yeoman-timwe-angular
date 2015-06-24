(function(){
    'use strict';

    angular
        .module('app.widgets')
        .directive('someWidget', someWidget);

    //someWidget.$inject = [];
    /* @ngInject */
    function someWidget() {
        return {
            link: link,
            templateUrl: '/app/components/_someWidget.html',
            replace: true
        };

        function link(scope, element, attrs) {
            console.log(element);
        }
    }
})();