angular.module('app.settings', [])
    .value('settings', {});

function startApp() {
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['app']);
    });
}

(function setConfigAndStart() {
    var $http = angular.injector(['ng']).get('$http'),
        defaults = getDefaults();

    function getDefaults() {
        return $http({
            method: 'GET',
            url: './defaults.settings.json'
        }).success(function(data) {
            if (data.env == 'dev') {
                defaults = data.settings;
                return defaults;
            }
            defaults = null;
            return defaults;
        });
    }

    $http({
        method: 'POST',
        url: 'proxy.php',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        data: {
            'a': 'pages/6'
        },
        transformRequest: appendTransform
    })
        .success(function(data) {
            // Errors are get in handled here because connection with the proxy.php is always done with success
            // even if exists connection errors.
            if (data == 0) {
                // BOOTSTRAP ERROR PAGE
                console.error('There was an error connecting to the Web Application API.');
                angular.module('app.settings', [])
                    .value('settings', false);
                startApp();
                return;
            }

            var config,
                customFields = data["custom-fields"],
                hiddenCategories = [],
                i = 0,
                pixelParams = encodeURIComponent(encodeURIComponent(removeURLParameterFromQueryStr(location.search, 'tid'))),
                trackingId = getParameterByName('tid');

            if (customFields.neo_settings_hidden_categories.length > 0)
                for (i; customFields.neo_settings_hidden_categories.length > i; i++) {
                    hiddenCategories.push(customFields.neo_settings_hidden_categories[i]);
                }

            config = {
                siteName: encodeURIComponent(location.href),
                deviceId: defaults.deviceId,
                channelId: customFields.neo_settings_channel[0] || defaults.channelId,
                viewId: customFields.neo_contents_view_id[0] || defaults.viewId,
                typeId: customFields.neo_contents_type_id[0] || defaults.typeId,
                clubId: customFields.neo_settings_club[0] || defaults.clubId,
                countryId: customFields.neo_settings_country[0] || defaults.countryId,
                featuredCategory: customFields.neo_contents_featured_category[0] || defaults.featuredCategory,
                hiddenCategories: hiddenCategories || defaults.hiddenCategories,
                slideshowMedias: customFields.slideshow_medias || defaults.slideshowMedias,
                sessionId: data.sessid || defaults.sessionId,
                clientIp: data.timwe_client_ip || defaults.clientIp,
                trackingId: trackingId || defaults.trackingId,
                subId: getParameterByName('sub'),
                campUrl: encodeURIComponent(location.href),
                pixelParams: pixelParams,
                msisdn: null,
                opid: null,
                msisdnFwd: data.msisdn_fwd,
                operatorIp: data.operator_ip
            };
            angular.module('app.settings', [])
                .value('settings', config);

            startApp();
        });


    /**
     * Util Functions
     */
    function appendTransform(data) {

        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        // Append the new transformation to the defaults
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }

    function removeURLParameterFromQueryStr(url, parameter) {
        var urlparts = url.split('?');
        if (urlparts.length >= 2) {

            var prefix = encodeURIComponent(parameter) + '=';
            var pars = urlparts[1].split(/[&;]/g);

            //reverse iteration as may be destructive
            for (var i = pars.length; i-- > 0;) {
                //idiom for string.startsWith
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }

            // Original version from NET. commented by EF:
            //url= urlparts[0]+'?'+pars.join('&');
            url = pars.join('&');
            return url;
        } else {
            return url;
        }
    }

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}());