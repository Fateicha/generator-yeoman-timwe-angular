(function(){
    'use strict';

    angular.module('app.core', [
        /*
         * Angular features
         */
        'ngAnimate', 'ngSanitize',
        /*
         * 3rd Party features
         */
        'ui.router'
        <% if (ionic) { %>,'ionic'<% } %>
    ]);

})();