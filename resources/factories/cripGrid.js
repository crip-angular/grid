(function (ng, Object, crip) {
    'use strict';

    crip.grid
        .factory('cripGrid', cripGrid);

    cripGrid.$inject = ['$injector', 'cripStrRandom', 'cripGridConfig', 'cripGridEvents'];

    function cripGrid($injector, rnd, cripGridConfig, events) {
        return {
            extend: extend
        };

        function extend(params) {
            if (!ng.isDefined(params.scope)) {
                throw new Error('cripGrid parameters should contain `scope` property to extend!')
            }

            if (!ng.isDefined(params.scope.$broadcast) || !ng.isFunction(params.scope.$broadcast)
                || !ng.isDefined(params.scope.$watch) || !ng.isFunction(params.scope.$watch)) {
                throw new Error('cripGrid parameter `scope` should contain `$broadcast` and `$watch` methods to communicate with other parts of code in core!')
            }

            if (!ng.isDefined(params.paginate) || !ng.isFunction(params.paginate)) {
                throw new Error('cripGrid parameters should contain `paginate` method to call new page content!')
            }

            if (!ng.isDefined(params.name)) {
                params.name = rnd.new();
            }

            ng.extend(params.scope, {
                // grid initial data
                grid: {
                    loading: false,
                    // unique identifier for grid
                    name: params.name,
                    // grid ordering data
                    sort: {
                        field: 'id',
                        direction: 'desc'
                    },
                    // grid pagination data
                    pagination: {
                        page: 1,
                        total: 0,
                        perPage: cripGridConfig.getDefaultPerPageOption(),
                        pageSizes: cripGridConfig.getPerPageOptions()
                    },
                    // grid filters
                    filters: {},
                    // display grid filters
                    showFilters: false,
                    // all current grid data
                    data: [],
                    sortBy: sortBy,
                    filter: filter,
                    isAscFor: isAscFor,
                    isDescFor: isDescFor,
                    setPageData: setPageData,
                    clearFilters: clearFilters,
                    requestParams: requestParams
                }
            });

            var grid = params.scope.grid;

            params.scope.$on(events.externallyChanged, _onGridExternallyChanged);
            params.scope.$watch('grid.sort', _watchGridSort, true);
            params.scope.$watch('grid.filters', _watchGridFilters, true);
            params.scope.$watch('grid.pagination', _watchGridPagination, true);

            var plugins = cripGridConfig.getPlugins() || {};
            if (ng.isDefined(params.plugins)) {
                ng.extend(plugins, params.plugins);
            }
            //$log.log('cripGrid -> started', {plugins: plugins, grid: params.scope.grid});
            ng.forEach(plugins, function (plugin_params, plugin) {
                var PluginInstance = $injector.get(plugin);
                // enable plugins {name, scope, paginate, plugins}
                PluginInstance.extend({
                    scope: params.scope,
                    paginate: params.paginate,
                    name: params.name,
                    plugins: plugin_params
                });
            });

            // if has filters after init, show filters area
            grid.showFilters = (!!Object.keys(grid.filters).length) || grid.showFilters;

            function sortBy(field) {
                var new_direction = grid.sort.direction === 'asc' ? 'desc' : 'asc';
                if (field !== grid.sort.field) {
                    new_direction = grid.sort.direction;
                }

                // fire event on sort change
                params.scope.$broadcast(events.sortChanged, {
                    field: field,
                    direction: new_direction,
                    name: grid.name
                });

                grid.sort.direction = new_direction;
                grid.sort.field = field;
            }

            function isAscFor(field) {
                return field === grid.sort.field && grid.sort.direction === 'asc';
            }

            function isDescFor(field) {
                return field === grid.sort.field && grid.sort.direction === 'desc';
            }

            function setPageData(data, total) {
                // fire event on page data change
                params.scope.$broadcast(events.dataChanged, {
                    data: data,
                    total: total,
                    name: grid.name
                });

                grid.data = data;
                grid.pagination.total = total;

                if (!params.scope.$$phase) {
                    params.scope.$apply();
                }
            }

            // customFilters will be appended to filters parameter
            // staticParams will be passed as get parameters to request
            function requestParams(staticParams, customFilters) {
                var filter_values = ng.copy(grid.filters),
                    filters = prepareFilters(filter_values),
                    mappings = cripGridConfig.getRequestMappings(),
                    url_params = {};

                if (customFilters) {
                    ng.extend(filters, customFilters);
                }

                url_params[mappings.page] = grid.pagination.page;
                url_params[mappings.perPage] = grid.pagination.perPage;
                url_params[mappings.direction] = grid.sort.direction;
                url_params[mappings.order] = grid.sort.field;
                url_params[mappings.filters] = ng.toJson(filters);

                if (staticParams) {
                    ng.extend(url_params, staticParams);
                }

                return url_params;
            }

            function filter(e) {
                if (isSubmittableEvent(e) && !grid.loading) {
                    params.scope.$broadcast(events.filtersChanged, {
                        filters: grid.filters,
                        name: grid.name
                    });
                    params.paginate(events.filtersChanged, {'event': e, filters: grid.filters, grid: grid.name});
                }
            }

            function clearFilters(e) {
                if (isSubmittableEvent(e) && !grid.loading) {
                    grid.filters = {};
                    filter(e);
                }
            }

            function _onGridExternallyChanged(e, data) {
                if (data.name === params.name) {
                    ng.forEach(data, function (value, key) {
                        if (key === 'filters') {
                            var filters = Object.keys(grid[key]),
                                newFilters = Object.keys(value),
                                diff = filters.diff(newFilters);
                            if (diff.length > 0)
                                for (var deleted in diff)
                                    if (diff.hasOwnProperty(deleted))
                                        delete grid[key][diff[deleted]];
                        }
                        if (ng.isObject(value))
                            ng.forEach(value, function (prop, i) {
                                if (ng.isString(prop))
                                    grid[key][i] = prop;
                            });
                        else if (ng.isString(value))
                            grid[key] = value;
                    });
                }
            }

            function _watchGridSort(n, o) {
                if (isOrderChanged(n, o)) {
                    ng.extend(n, {name: grid.name});
                    params.scope.$broadcast(events.sortChanged, n);
                    params.paginate(events.sortChanged, {'new': n, 'old': o});
                }
            }

            function _watchGridPagination(n, o) {
                if (isPageChanged(n, o)) {
                    ng.extend(n, {name: grid.name});
                    params.scope.$broadcast(events.paginationChanged, n);
                    params.paginate(events.paginationChanged, {'new': n, 'old': o});
                }
            }

            function _watchGridFilters(n, o) {
                if (cripGridConfig.updateOnFilterChange && !ng.equals(n, o)) {
                    filter(true);
                }
            }
        }

        function prepareFilters(filters) {
            var ret = [];
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    ret.push([key, filters[key]]);
                }
            }
            return ret;
        }

        function isSubmittableEvent(event) {
            return event === true ||
                event.type === 'click' || event.type === 'submit' ||
                ( event.type === 'keypress' && event.keyCode === 13 );
        }

        function isPageChanged(n, o) {
            return n !== o && (parseInt(n.page) !== parseInt(o.page) || parseInt(n.perPage) !== parseInt(o.perPage));
        }

        function isOrderChanged(n, o) {
            return n !== o && (n.direction !== o.direction || n.field !== o.field);
        }
    }
})(angular, Object, window.crip || (window.crip = {}));