(function (ng, crip) {
    'use strict';

    crip.grid
        .provider('cripGridConfig', cripGridConfig);

    cripGridConfig.$inject = [];

    function cripGridConfig() {
        var plugins = {},
            request_props = setRequestMappings(),
            default_per_page = 10,
            per_page = [10, 25, 50];

        var scope = this;

        ng.extend(scope, {
            getPlugins: getPlugins,
            setPlugins: setPlugins,
            getRequestMappings: getRequestMappings,
            setRequestMappings: setRequestMappings,
            setPerPageOptions: setPerPageOptions,
            updateOnFilterChange: false
        });

        this.$get = [$get];

        function $get() {
            return {
                getPlugins: getPlugins,
                getRequestMappings: getRequestMappings,
                getPerPageOptions: getPerPageOptions,
                getDefaultPerPageOption: getDefaultPerPageOption,
                updateOnFilterChange: scope.updateOnFilterChange
            };
        }

        function getPlugins() {
            return plugins;
        }

        function setPlugins(newPluginConfig) {
            return plugins = ng.copy(newPluginConfig);
        }

        function getRequestMappings() {
            return request_props;
        }

        function setRequestMappings(page, perPage, direction, order, filters) {
            return request_props = {
                page: page || 'page',
                perPage: perPage || 'per-page',
                direction: direction || 'direction',
                order: order || 'order',
                filters: filters || 'filters'
            };
        }

        function getPerPageOptions() {
            return per_page;
        }

        function getDefaultPerPageOption() {
            return default_per_page;
        }

        function setPerPageOptions(per_page_options) {
            if (ng.isArray(per_page_options) && per_page_options.length > 0) {
                default_per_page = per_page_options[0];
                return per_page = per_page_options;
            }
            throw new Error('per_page_options can be array from integers');
        }
    }
})(angular, window.crip || (window.crip = {}));