/**
 * Created by andre.fatia on 16/03/2015.
 */
(function () {
    'use strict';

    angular.module('app', [
    /**
     * Load Core Module and Components
     */
        <% if (appSettings) { %>'app.settings',<% } %>
        'app.core',
        'app.widgets',
    /**
     * Load Features Module
     */
        'app.layout',
        'app.feature'
    ]);

})();