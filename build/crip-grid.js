(function (ng, crip) {
    'use strict';

    crip.grid = ng.module('crip.grid', [
        'crip.core',
        'crip.grid.templates'
    ]);

})(angular, window.crip || (window.crip = {}));
(function (angular, crip) {
    'use strict';

    crip.grid
        .constant('cripGridEvents', {
            externallyChanged: 'crip-grid-externally-changed',
            paginationChanged: 'crip-grid-pagination-changed',
            filtersChanged: 'crip-grid-filters-changed',
            dataChanged: 'cript-grid-data-changed',
            sortChanged: 'crip-grid-sort-changed'
        });

})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.grid
        .constant('cripPaginationConfig', {
            maxSize: 5,
            boundaryLinks: true,
            directionLinks: true,
            firstText: 'First',
            previousText: 'Previous',
            nextText: 'Next',
            lastText: 'Last'
        });

})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.grid
        .directive('cripGridPerPage', cripGridPerPage);

    cripGridPerPage.$inject = ['cripGridConfig'];

    function cripGridPerPage(cripGridConfig) {
        return {
            restrict: 'A',
            templateUrl: templateUrl,
            scope: {
                cripGridPerPage: '=',
                cripClass: '@'
            },
            replace: false,
            transclude: true,
            link: link
        };

        function templateUrl(element, attrs) {
            return attrs.templateUrl || '/crip/grid/per-page.html';
        }

        function link(scope, element, attrs, ctrl) {
            scope.selected = parseInt(scope.cripGridPerPage.pagination.perPage, 10)
                || cripGridConfig.getDefaultPerPageOption();
            scope.options = scope.cripGridPerPage.pagination.pageSizes;

            scope.$watch('selected', function (n) {
                if (n !== scope.cripGridPerPage.pagination.perPage)
                    scope.cripGridPerPage.pagination.perPage = n;
            });
        }
    }


})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.grid
        .directive('cripGridTh', cripGridTh);

    cripGridTh.$inject = [];

    function cripGridTh() {
        return {
            restrict: 'A',
            templateUrl: templateUrl,
            scope: {
                cripGridTh: '=',
                cripText: '@',
                cripName: '@',
                cripTitle: '@'
            },
            replace: false,
            transclude: true,
            link: link
        };

        function templateUrl(element, attrs) {
            return attrs.templateUrl || '/crip/grid/th.html';
        }

        function link(scope, element, attrs, ctrl) {
            if (!scope.cripTitle)
                scope.cripTitle = scope.cripText;

            element
                .addClass('crip-grid th')
                .find('a')
                .on('click', function () {
                    this.blur();
                });
        }
    }


})(angular, window.crip || (window.crip = {}));
(function (ng, crip) {
    'use strict';

    crip.grid
        .directive('cripGridPagination', cripGridPagination);

    cripGridPagination.$inject = ['cripPaginationConfig'];

    function cripGridPagination(cripPaginationConfig) {
        return {
            restrict: 'A',
            templateUrl: templateUrl,
            scope: {
                cripGridPagination: '=',
                firstText: '@',
                previousText: '@',
                nextText: '@',
                lastText: '@'
            },
            replace: false,
            transclude: true,
            link: link
        };

        function templateUrl(element, attrs) {
            return attrs.templateUrl || '/crip/grid/pagination.html';
        }

        function link(scope, element, attrs, ctrl) {
            onPagingChange(0, 1);
            scope.pages = getPages(scope.cripGridPagination.page, scope.cripGridPagination.totalPages, attrOrConfig('maxSize'));

            scope.selectPage = function (page, e) {
                if (e) {
                    e.preventDefault();
                }

                if (scope.cripGridPagination.page !== page && page > 0 && page <= scope.cripGridPagination.totalPages) {
                    if (e && e.target) {
                        e.target.blur();
                    }
                    scope.cripGridPagination.page = page;
                }
            };

            scope.getText = function (key) {
                return scope[key + 'Text'] || cripPaginationConfig[key + 'Text'];
            };

            scope.noPrevious = function () {
                return scope.cripGridPagination.page == 1;
            };

            scope.noNext = function () {
                return scope.cripGridPagination.page == scope.cripGridPagination.totalPages;
            };

            scope.boundaryLinks = attrOrConfig('boundaryLinks');
            scope.directionLinks = attrOrConfig('directionLinks');

            scope.$watch('cripGridPagination.total', onPagingChange);
            scope.$watch('cripGridPagination.perPage', onPagingChange);
            scope.$watch('cripGridPagination.page', onPagingChange);

            function onPagingChange(n, o) {
                if (o != n) {
                    scope.cripGridPagination.totalPages = calculateTotalPages();
                    updatePage()
                }
            }

            function calculateTotalPages() {
                var totalPages = scope.cripGridPagination.perPage < 1 ?
                    1 : Math.ceil(scope.cripGridPagination.total / scope.cripGridPagination.perPage);
                return Math.max(totalPages || 0, 1);
            }

            function updatePage() {
                scope.cripGridPagination.page = parseInt(scope.cripGridPagination.page, 10) || 1;
                scope.pages = getPages(scope.cripGridPagination.page, scope.cripGridPagination.totalPages, attrOrConfig('maxSize'));
                if (scope.cripGridPagination.page > scope.cripGridPagination.totalPages)
                    scope.selectPage(scope.cripGridPagination.totalPages);
            }

            // Create page object used in template
            function makePage(number, text, isActive) {
                return {
                    number: number,
                    text: text,
                    active: isActive
                };
            }

            function getPages(currentPage, totalPages, maxSize) {
                var pages = [];

                // Default page limits
                var startPage = 1, endPage = totalPages;
                var isMaxSized = ng.isDefined(maxSize) && maxSize < totalPages;

                // recompute if maxSize
                if (isMaxSized) {
                    startPage = Math.ceil(currentPage - (maxSize / 2));

                    if (startPage < Math.floor(maxSize / 2))
                        startPage = 1;

                    endPage = startPage + maxSize - 1;

                    if (endPage >= totalPages) {
                        endPage = totalPages;
                        startPage = totalPages - maxSize + 1;
                    }
                }

                // Add page number links
                for (var number = startPage; number <= endPage; number++) {
                    var page = makePage(number, number, number == currentPage);
                    pages.push(page);
                }

                // Add links to move between page sets
                if (isMaxSized && maxSize > 0) {
                    if (startPage > 1) {
                        //need ellipsis for all options unless range is too close to beginning
                        var previousPageSet = makePage(startPage - 1, '...', false);
                        pages.unshift(previousPageSet);
                    }

                    if (endPage < totalPages) {
                        //need ellipsis for all options unless range is too close to end
                        var nextPageSet = makePage(endPage + 1, '...', false);
                        pages.push(nextPageSet);
                    }
                }

                return pages;
            }

            function attrOrConfig(key) {
                return ng.isDefined(attrs[key]) ? attrs[key] : cripPaginationConfig[key];
            }
        }
    }


})(angular, window.crip || (window.crip = {}));
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
angular.module("crip.grid.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/crip/grid/pagination.html","<ul class=\"pagination\">\r\n    <li ng-if=\"::boundaryLinks\"\r\n        ng-class=\"{disabled: noPrevious()}\"\r\n        class=\"pagination-first\">\r\n        <a href ng-click=\"selectPage(1, $event)\">{{::getText(\'first\')}}</a>\r\n    </li>\r\n\r\n    <li ng-if=\"::directionLinks\"\r\n        ng-class=\"{disabled: noPrevious()}\"\r\n        class=\"pagination-prev\">\r\n        <a href ng-click=\"selectPage(cripGridPagination.page - 1, $event)\">{{::getText(\'previous\')}}</a>\r\n    </li>\r\n\r\n    <li ng-repeat=\"page in pages\"\r\n        ng-class=\"{active: page.active}\"\r\n        class=\"pagination-page\">\r\n        <a href ng-click=\"selectPage(page.number, $event)\">{{page.text}}</a>\r\n    </li>\r\n\r\n    <li ng-if=\"::directionLinks\"\r\n        ng-class=\"{disabled: noNext()}\"\r\n        class=\"pagination-next\">\r\n        <a href ng-click=\"selectPage(cripGridPagination.page + 1, $event)\">{{::getText(\'next\')}}</a>\r\n    </li>\r\n\r\n    <li ng-if=\"::boundaryLinks\"\r\n        ng-class=\"{disabled: noNext()}\"\r\n        class=\"pagination-last\">\r\n        <a href ng-click=\"selectPage(cripGridPagination.totalPages, $event)\">{{::getText(\'last\')}}</a>\r\n    </li>\r\n</ul>");
$templateCache.put("/crip/grid/per-page.html","<span ng-transclude></span>\r\n<select class=\"c-per-page form-control {{cripClass}}\"\r\n        ng-model=\"selected\"\r\n        ng-options=\"size as size for size in options\"></select>");
$templateCache.put("/crip/grid/th.html","<a href title=\"{{cripTitle}}\"\r\n   ng-click=\"cripGridTh.sortBy(cripName)\">\r\n    <i class=\"crip-icon fa pull-right\"\r\n       ng-class=\"{\'fa-sort-desc\': cripGridTh.isDescFor(cripName),\r\n                  \'fa-sort-asc\': cripGridTh.isAscFor(cripName)}\"></i> <span ng-transclude></span>\r\n</a>");}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdyaWQubW9kdWxlLmpzIiwiY29uc3RhbnRzL2NyaXBHcmlkRXZlbnRzLmpzIiwiY29uc3RhbnRzL2NyaXBQYWdpbmF0aW9uQ29uZmlnLmpzIiwiZGlyZWN0aXZlcy9jcmlwR3JpZFBlclBhZ2UuanMiLCJkaXJlY3RpdmVzL2NyaXBHcmlkVGguanMiLCJkaXJlY3RpdmVzL2NyaXB0R3JpZFBhZ2luYXRpb24uanMiLCJmYWN0b3JpZXMvY3JpcEdyaWQuanMiLCJwcm92aWRlcnMvY3JpcEdyaWRDb25maWcuanMiLCJ0ZW1wbGF0ZXMvdGVtcGxhdGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNFQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY3JpcC1ncmlkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZ3JpZCA9IG5nLm1vZHVsZSgnY3JpcC5ncmlkJywgW1xyXG4gICAgICAgICdjcmlwLmNvcmUnLFxyXG4gICAgICAgICdjcmlwLmdyaWQudGVtcGxhdGVzJ1xyXG4gICAgXSk7XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAoYW5ndWxhciwgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZ3JpZFxyXG4gICAgICAgIC5jb25zdGFudCgnY3JpcEdyaWRFdmVudHMnLCB7XHJcbiAgICAgICAgICAgIGV4dGVybmFsbHlDaGFuZ2VkOiAnY3JpcC1ncmlkLWV4dGVybmFsbHktY2hhbmdlZCcsXHJcbiAgICAgICAgICAgIHBhZ2luYXRpb25DaGFuZ2VkOiAnY3JpcC1ncmlkLXBhZ2luYXRpb24tY2hhbmdlZCcsXHJcbiAgICAgICAgICAgIGZpbHRlcnNDaGFuZ2VkOiAnY3JpcC1ncmlkLWZpbHRlcnMtY2hhbmdlZCcsXHJcbiAgICAgICAgICAgIGRhdGFDaGFuZ2VkOiAnY3JpcHQtZ3JpZC1kYXRhLWNoYW5nZWQnLFxyXG4gICAgICAgICAgICBzb3J0Q2hhbmdlZDogJ2NyaXAtZ3JpZC1zb3J0LWNoYW5nZWQnXHJcbiAgICAgICAgfSk7XHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmdyaWRcclxuICAgICAgICAuY29uc3RhbnQoJ2NyaXBQYWdpbmF0aW9uQ29uZmlnJywge1xyXG4gICAgICAgICAgICBtYXhTaXplOiA1LFxyXG4gICAgICAgICAgICBib3VuZGFyeUxpbmtzOiB0cnVlLFxyXG4gICAgICAgICAgICBkaXJlY3Rpb25MaW5rczogdHJ1ZSxcclxuICAgICAgICAgICAgZmlyc3RUZXh0OiAnRmlyc3QnLFxyXG4gICAgICAgICAgICBwcmV2aW91c1RleHQ6ICdQcmV2aW91cycsXHJcbiAgICAgICAgICAgIG5leHRUZXh0OiAnTmV4dCcsXHJcbiAgICAgICAgICAgIGxhc3RUZXh0OiAnTGFzdCdcclxuICAgICAgICB9KTtcclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZ3JpZFxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBHcmlkUGVyUGFnZScsIGNyaXBHcmlkUGVyUGFnZSk7XHJcblxyXG4gICAgY3JpcEdyaWRQZXJQYWdlLiRpbmplY3QgPSBbJ2NyaXBHcmlkQ29uZmlnJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEdyaWRQZXJQYWdlKGNyaXBHcmlkQ29uZmlnKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRlbXBsYXRlVXJsLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgY3JpcEdyaWRQZXJQYWdlOiAnPScsXHJcbiAgICAgICAgICAgICAgICBjcmlwQ2xhc3M6ICdAJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcclxuICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICAgICAgbGluazogbGlua1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHRlbXBsYXRlVXJsKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAnL2NyaXAvZ3JpZC9wZXItcGFnZS5odG1sJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdGVkID0gcGFyc2VJbnQoc2NvcGUuY3JpcEdyaWRQZXJQYWdlLnBhZ2luYXRpb24ucGVyUGFnZSwgMTApXHJcbiAgICAgICAgICAgICAgICB8fCBjcmlwR3JpZENvbmZpZy5nZXREZWZhdWx0UGVyUGFnZU9wdGlvbigpO1xyXG4gICAgICAgICAgICBzY29wZS5vcHRpb25zID0gc2NvcGUuY3JpcEdyaWRQZXJQYWdlLnBhZ2luYXRpb24ucGFnZVNpemVzO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdzZWxlY3RlZCcsIGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobiAhPT0gc2NvcGUuY3JpcEdyaWRQZXJQYWdlLnBhZ2luYXRpb24ucGVyUGFnZSlcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5jcmlwR3JpZFBlclBhZ2UucGFnaW5hdGlvbi5wZXJQYWdlID0gbjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgY3JpcCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNyaXAuZ3JpZFxyXG4gICAgICAgIC5kaXJlY3RpdmUoJ2NyaXBHcmlkVGgnLCBjcmlwR3JpZFRoKTtcclxuXHJcbiAgICBjcmlwR3JpZFRoLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmlwR3JpZFRoKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGNyaXBHcmlkVGg6ICc9JyxcclxuICAgICAgICAgICAgICAgIGNyaXBUZXh0OiAnQCcsXHJcbiAgICAgICAgICAgICAgICBjcmlwTmFtZTogJ0AnLFxyXG4gICAgICAgICAgICAgICAgY3JpcFRpdGxlOiAnQCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB0ZW1wbGF0ZVVybChlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJy9jcmlwL2dyaWQvdGguaHRtbCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBpZiAoIXNjb3BlLmNyaXBUaXRsZSlcclxuICAgICAgICAgICAgICAgIHNjb3BlLmNyaXBUaXRsZSA9IHNjb3BlLmNyaXBUZXh0O1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjcmlwLWdyaWQgdGgnKVxyXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2EnKVxyXG4gICAgICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsdXIoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsIihmdW5jdGlvbiAobmcsIGNyaXApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjcmlwLmdyaWRcclxuICAgICAgICAuZGlyZWN0aXZlKCdjcmlwR3JpZFBhZ2luYXRpb24nLCBjcmlwR3JpZFBhZ2luYXRpb24pO1xyXG5cclxuICAgIGNyaXBHcmlkUGFnaW5hdGlvbi4kaW5qZWN0ID0gWydjcmlwUGFnaW5hdGlvbkNvbmZpZyddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyaXBHcmlkUGFnaW5hdGlvbihjcmlwUGFnaW5hdGlvbkNvbmZpZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGNyaXBHcmlkUGFnaW5hdGlvbjogJz0nLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RUZXh0OiAnQCcsXHJcbiAgICAgICAgICAgICAgICBwcmV2aW91c1RleHQ6ICdAJyxcclxuICAgICAgICAgICAgICAgIG5leHRUZXh0OiAnQCcsXHJcbiAgICAgICAgICAgICAgICBsYXN0VGV4dDogJ0AnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxyXG4gICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdGVtcGxhdGVVcmwoZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICcvY3JpcC9ncmlkL3BhZ2luYXRpb24uaHRtbCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xyXG4gICAgICAgICAgICBvblBhZ2luZ0NoYW5nZSgwLCAxKTtcclxuICAgICAgICAgICAgc2NvcGUucGFnZXMgPSBnZXRQYWdlcyhzY29wZS5jcmlwR3JpZFBhZ2luYXRpb24ucGFnZSwgc2NvcGUuY3JpcEdyaWRQYWdpbmF0aW9uLnRvdGFsUGFnZXMsIGF0dHJPckNvbmZpZygnbWF4U2l6ZScpKTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdFBhZ2UgPSBmdW5jdGlvbiAocGFnZSwgZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi5wYWdlICE9PSBwYWdlICYmIHBhZ2UgPiAwICYmIHBhZ2UgPD0gc2NvcGUuY3JpcEdyaWRQYWdpbmF0aW9uLnRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZSAmJiBlLnRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5ibHVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi5wYWdlID0gcGFnZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmdldFRleHQgPSBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGVba2V5ICsgJ1RleHQnXSB8fCBjcmlwUGFnaW5hdGlvbkNvbmZpZ1trZXkgKyAnVGV4dCddO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgc2NvcGUubm9QcmV2aW91cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5jcmlwR3JpZFBhZ2luYXRpb24ucGFnZSA9PSAxO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgc2NvcGUubm9OZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi5wYWdlID09IHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi50b3RhbFBhZ2VzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuYm91bmRhcnlMaW5rcyA9IGF0dHJPckNvbmZpZygnYm91bmRhcnlMaW5rcycpO1xyXG4gICAgICAgICAgICBzY29wZS5kaXJlY3Rpb25MaW5rcyA9IGF0dHJPckNvbmZpZygnZGlyZWN0aW9uTGlua3MnKTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnY3JpcEdyaWRQYWdpbmF0aW9uLnRvdGFsJywgb25QYWdpbmdDaGFuZ2UpO1xyXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2NyaXBHcmlkUGFnaW5hdGlvbi5wZXJQYWdlJywgb25QYWdpbmdDaGFuZ2UpO1xyXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2NyaXBHcmlkUGFnaW5hdGlvbi5wYWdlJywgb25QYWdpbmdDaGFuZ2UpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gb25QYWdpbmdDaGFuZ2Uobiwgbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG8gIT0gbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi50b3RhbFBhZ2VzID0gY2FsY3VsYXRlVG90YWxQYWdlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVBhZ2UoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVUb3RhbFBhZ2VzKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsUGFnZXMgPSBzY29wZS5jcmlwR3JpZFBhZ2luYXRpb24ucGVyUGFnZSA8IDEgP1xyXG4gICAgICAgICAgICAgICAgICAgIDEgOiBNYXRoLmNlaWwoc2NvcGUuY3JpcEdyaWRQYWdpbmF0aW9uLnRvdGFsIC8gc2NvcGUuY3JpcEdyaWRQYWdpbmF0aW9uLnBlclBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KHRvdGFsUGFnZXMgfHwgMCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVBhZ2UoKSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5jcmlwR3JpZFBhZ2luYXRpb24ucGFnZSA9IHBhcnNlSW50KHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi5wYWdlLCAxMCkgfHwgMTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnBhZ2VzID0gZ2V0UGFnZXMoc2NvcGUuY3JpcEdyaWRQYWdpbmF0aW9uLnBhZ2UsIHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi50b3RhbFBhZ2VzLCBhdHRyT3JDb25maWcoJ21heFNpemUnKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUuY3JpcEdyaWRQYWdpbmF0aW9uLnBhZ2UgPiBzY29wZS5jcmlwR3JpZFBhZ2luYXRpb24udG90YWxQYWdlcylcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5zZWxlY3RQYWdlKHNjb3BlLmNyaXBHcmlkUGFnaW5hdGlvbi50b3RhbFBhZ2VzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHBhZ2Ugb2JqZWN0IHVzZWQgaW4gdGVtcGxhdGVcclxuICAgICAgICAgICAgZnVuY3Rpb24gbWFrZVBhZ2UobnVtYmVyLCB0ZXh0LCBpc0FjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBudW1iZXI6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogaXNBY3RpdmVcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFBhZ2VzKGN1cnJlbnRQYWdlLCB0b3RhbFBhZ2VzLCBtYXhTaXplKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFnZXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZWZhdWx0IHBhZ2UgbGltaXRzXHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRQYWdlID0gMSwgZW5kUGFnZSA9IHRvdGFsUGFnZXM7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNNYXhTaXplZCA9IG5nLmlzRGVmaW5lZChtYXhTaXplKSAmJiBtYXhTaXplIDwgdG90YWxQYWdlcztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyByZWNvbXB1dGUgaWYgbWF4U2l6ZVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzTWF4U2l6ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydFBhZ2UgPSBNYXRoLmNlaWwoY3VycmVudFBhZ2UgLSAobWF4U2l6ZSAvIDIpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0UGFnZSA8IE1hdGguZmxvb3IobWF4U2l6ZSAvIDIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFBhZ2UgPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBlbmRQYWdlID0gc3RhcnRQYWdlICsgbWF4U2l6ZSAtIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmRQYWdlID49IHRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kUGFnZSA9IHRvdGFsUGFnZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0UGFnZSA9IHRvdGFsUGFnZXMgLSBtYXhTaXplICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHBhZ2UgbnVtYmVyIGxpbmtzXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBudW1iZXIgPSBzdGFydFBhZ2U7IG51bWJlciA8PSBlbmRQYWdlOyBudW1iZXIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWdlID0gbWFrZVBhZ2UobnVtYmVyLCBudW1iZXIsIG51bWJlciA9PSBjdXJyZW50UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgbGlua3MgdG8gbW92ZSBiZXR3ZWVuIHBhZ2Ugc2V0c1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTWF4U2l6ZWQgJiYgbWF4U2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRQYWdlID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25lZWQgZWxsaXBzaXMgZm9yIGFsbCBvcHRpb25zIHVubGVzcyByYW5nZSBpcyB0b28gY2xvc2UgdG8gYmVnaW5uaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c1BhZ2VTZXQgPSBtYWtlUGFnZShzdGFydFBhZ2UgLSAxLCAnLi4uJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlcy51bnNoaWZ0KHByZXZpb3VzUGFnZVNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kUGFnZSA8IHRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9uZWVkIGVsbGlwc2lzIGZvciBhbGwgb3B0aW9ucyB1bmxlc3MgcmFuZ2UgaXMgdG9vIGNsb3NlIHRvIGVuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dFBhZ2VTZXQgPSBtYWtlUGFnZShlbmRQYWdlICsgMSwgJy4uLicsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZXMucHVzaChuZXh0UGFnZVNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBwYWdlcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYXR0ck9yQ29uZmlnKGtleSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5nLmlzRGVmaW5lZChhdHRyc1trZXldKSA/IGF0dHJzW2tleV0gOiBjcmlwUGFnaW5hdGlvbkNvbmZpZ1trZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbn0pKGFuZ3VsYXIsIHdpbmRvdy5jcmlwIHx8ICh3aW5kb3cuY3JpcCA9IHt9KSk7IiwiKGZ1bmN0aW9uIChuZywgT2JqZWN0LCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5ncmlkXHJcbiAgICAgICAgLmZhY3RvcnkoJ2NyaXBHcmlkJywgY3JpcEdyaWQpO1xyXG5cclxuICAgIGNyaXBHcmlkLiRpbmplY3QgPSBbJyRpbmplY3RvcicsICdjcmlwU3RyUmFuZG9tJywgJ2NyaXBHcmlkQ29uZmlnJywgJ2NyaXBHcmlkRXZlbnRzJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEdyaWQoJGluamVjdG9yLCBybmQsIGNyaXBHcmlkQ29uZmlnLCBldmVudHMpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBleHRlbmQ6IGV4dGVuZFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGV4dGVuZChwYXJhbXMpIHtcclxuICAgICAgICAgICAgaWYgKCFuZy5pc0RlZmluZWQocGFyYW1zLnNjb3BlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmlwR3JpZCBwYXJhbWV0ZXJzIHNob3VsZCBjb250YWluIGBzY29wZWAgcHJvcGVydHkgdG8gZXh0ZW5kIScpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmcuaXNEZWZpbmVkKHBhcmFtcy5zY29wZS4kYnJvYWRjYXN0KSB8fCAhbmcuaXNGdW5jdGlvbihwYXJhbXMuc2NvcGUuJGJyb2FkY2FzdClcclxuICAgICAgICAgICAgICAgIHx8ICFuZy5pc0RlZmluZWQocGFyYW1zLnNjb3BlLiR3YXRjaCkgfHwgIW5nLmlzRnVuY3Rpb24ocGFyYW1zLnNjb3BlLiR3YXRjaCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY3JpcEdyaWQgcGFyYW1ldGVyIGBzY29wZWAgc2hvdWxkIGNvbnRhaW4gYCRicm9hZGNhc3RgIGFuZCBgJHdhdGNoYCBtZXRob2RzIHRvIGNvbW11bmljYXRlIHdpdGggb3RoZXIgcGFydHMgb2YgY29kZSBpbiBjb3JlIScpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmcuaXNEZWZpbmVkKHBhcmFtcy5wYWdpbmF0ZSkgfHwgIW5nLmlzRnVuY3Rpb24ocGFyYW1zLnBhZ2luYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmlwR3JpZCBwYXJhbWV0ZXJzIHNob3VsZCBjb250YWluIGBwYWdpbmF0ZWAgbWV0aG9kIHRvIGNhbGwgbmV3IHBhZ2UgY29udGVudCEnKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5nLmlzRGVmaW5lZChwYXJhbXMubmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5uYW1lID0gcm5kLm5ldygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBuZy5leHRlbmQocGFyYW1zLnNjb3BlLCB7XHJcbiAgICAgICAgICAgICAgICAvLyBncmlkIGluaXRpYWwgZGF0YVxyXG4gICAgICAgICAgICAgICAgZ3JpZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVuaXF1ZSBpZGVudGlmaWVyIGZvciBncmlkXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyYW1zLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZ3JpZCBvcmRlcmluZyBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZDogJ2lkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAnZGVzYydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdyaWQgcGFnaW5hdGlvbiBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyUGFnZTogY3JpcEdyaWRDb25maWcuZ2V0RGVmYXVsdFBlclBhZ2VPcHRpb24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVNpemVzOiBjcmlwR3JpZENvbmZpZy5nZXRQZXJQYWdlT3B0aW9ucygpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBncmlkIGZpbHRlcnNcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBkaXNwbGF5IGdyaWQgZmlsdGVyc1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3dGaWx0ZXJzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBhbGwgY3VycmVudCBncmlkIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBzb3J0Qnk6IHNvcnRCeSxcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXI6IGZpbHRlcixcclxuICAgICAgICAgICAgICAgICAgICBpc0FzY0ZvcjogaXNBc2NGb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNEZXNjRm9yOiBpc0Rlc2NGb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0UGFnZURhdGE6IHNldFBhZ2VEYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyRmlsdGVyczogY2xlYXJGaWx0ZXJzLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RQYXJhbXM6IHJlcXVlc3RQYXJhbXNcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZ3JpZCA9IHBhcmFtcy5zY29wZS5ncmlkO1xyXG5cclxuICAgICAgICAgICAgcGFyYW1zLnNjb3BlLiRvbihldmVudHMuZXh0ZXJuYWxseUNoYW5nZWQsIF9vbkdyaWRFeHRlcm5hbGx5Q2hhbmdlZCk7XHJcbiAgICAgICAgICAgIHBhcmFtcy5zY29wZS4kd2F0Y2goJ2dyaWQuc29ydCcsIF93YXRjaEdyaWRTb3J0LCB0cnVlKTtcclxuICAgICAgICAgICAgcGFyYW1zLnNjb3BlLiR3YXRjaCgnZ3JpZC5maWx0ZXJzJywgX3dhdGNoR3JpZEZpbHRlcnMsIHRydWUpO1xyXG4gICAgICAgICAgICBwYXJhbXMuc2NvcGUuJHdhdGNoKCdncmlkLnBhZ2luYXRpb24nLCBfd2F0Y2hHcmlkUGFnaW5hdGlvbiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcGx1Z2lucyA9IGNyaXBHcmlkQ29uZmlnLmdldFBsdWdpbnMoKSB8fCB7fTtcclxuICAgICAgICAgICAgaWYgKG5nLmlzRGVmaW5lZChwYXJhbXMucGx1Z2lucykpIHtcclxuICAgICAgICAgICAgICAgIG5nLmV4dGVuZChwbHVnaW5zLCBwYXJhbXMucGx1Z2lucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8kbG9nLmxvZygnY3JpcEdyaWQgLT4gc3RhcnRlZCcsIHtwbHVnaW5zOiBwbHVnaW5zLCBncmlkOiBwYXJhbXMuc2NvcGUuZ3JpZH0pO1xyXG4gICAgICAgICAgICBuZy5mb3JFYWNoKHBsdWdpbnMsIGZ1bmN0aW9uIChwbHVnaW5fcGFyYW1zLCBwbHVnaW4pIHtcclxuICAgICAgICAgICAgICAgIHZhciBQbHVnaW5JbnN0YW5jZSA9ICRpbmplY3Rvci5nZXQocGx1Z2luKTtcclxuICAgICAgICAgICAgICAgIC8vIGVuYWJsZSBwbHVnaW5zIHtuYW1lLCBzY29wZSwgcGFnaW5hdGUsIHBsdWdpbnN9XHJcbiAgICAgICAgICAgICAgICBQbHVnaW5JbnN0YW5jZS5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiBwYXJhbXMuc2NvcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGU6IHBhcmFtcy5wYWdpbmF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJhbXMubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5zOiBwbHVnaW5fcGFyYW1zXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBoYXMgZmlsdGVycyBhZnRlciBpbml0LCBzaG93IGZpbHRlcnMgYXJlYVxyXG4gICAgICAgICAgICBncmlkLnNob3dGaWx0ZXJzID0gKCEhT2JqZWN0LmtleXMoZ3JpZC5maWx0ZXJzKS5sZW5ndGgpIHx8IGdyaWQuc2hvd0ZpbHRlcnM7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzb3J0QnkoZmllbGQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdfZGlyZWN0aW9uID0gZ3JpZC5zb3J0LmRpcmVjdGlvbiA9PT0gJ2FzYycgPyAnZGVzYycgOiAnYXNjJztcclxuICAgICAgICAgICAgICAgIGlmIChmaWVsZCAhPT0gZ3JpZC5zb3J0LmZpZWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3X2RpcmVjdGlvbiA9IGdyaWQuc29ydC5kaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZmlyZSBldmVudCBvbiBzb3J0IGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgcGFyYW1zLnNjb3BlLiRicm9hZGNhc3QoZXZlbnRzLnNvcnRDaGFuZ2VkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGZpZWxkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogbmV3X2RpcmVjdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBncmlkLm5hbWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGdyaWQuc29ydC5kaXJlY3Rpb24gPSBuZXdfZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgZ3JpZC5zb3J0LmZpZWxkID0gZmllbGQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXNjRm9yKGZpZWxkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmllbGQgPT09IGdyaWQuc29ydC5maWVsZCAmJiBncmlkLnNvcnQuZGlyZWN0aW9uID09PSAnYXNjJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaXNEZXNjRm9yKGZpZWxkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmllbGQgPT09IGdyaWQuc29ydC5maWVsZCAmJiBncmlkLnNvcnQuZGlyZWN0aW9uID09PSAnZGVzYyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldFBhZ2VEYXRhKGRhdGEsIHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaXJlIGV2ZW50IG9uIHBhZ2UgZGF0YSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5zY29wZS4kYnJvYWRjYXN0KGV2ZW50cy5kYXRhQ2hhbmdlZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgdG90YWw6IHRvdGFsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGdyaWQubmFtZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZ3JpZC5kYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgICAgIGdyaWQucGFnaW5hdGlvbi50b3RhbCA9IHRvdGFsO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnNjb3BlLiQkcGhhc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMuc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGN1c3RvbUZpbHRlcnMgd2lsbCBiZSBhcHBlbmRlZCB0byBmaWx0ZXJzIHBhcmFtZXRlclxyXG4gICAgICAgICAgICAvLyBzdGF0aWNQYXJhbXMgd2lsbCBiZSBwYXNzZWQgYXMgZ2V0IHBhcmFtZXRlcnMgdG8gcmVxdWVzdFxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZXF1ZXN0UGFyYW1zKHN0YXRpY1BhcmFtcywgY3VzdG9tRmlsdGVycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlcl92YWx1ZXMgPSBuZy5jb3B5KGdyaWQuZmlsdGVycyksXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycyA9IHByZXBhcmVGaWx0ZXJzKGZpbHRlcl92YWx1ZXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcHBpbmdzID0gY3JpcEdyaWRDb25maWcuZ2V0UmVxdWVzdE1hcHBpbmdzKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsX3BhcmFtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXN0b21GaWx0ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmcuZXh0ZW5kKGZpbHRlcnMsIGN1c3RvbUZpbHRlcnMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHVybF9wYXJhbXNbbWFwcGluZ3MucGFnZV0gPSBncmlkLnBhZ2luYXRpb24ucGFnZTtcclxuICAgICAgICAgICAgICAgIHVybF9wYXJhbXNbbWFwcGluZ3MucGVyUGFnZV0gPSBncmlkLnBhZ2luYXRpb24ucGVyUGFnZTtcclxuICAgICAgICAgICAgICAgIHVybF9wYXJhbXNbbWFwcGluZ3MuZGlyZWN0aW9uXSA9IGdyaWQuc29ydC5kaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICB1cmxfcGFyYW1zW21hcHBpbmdzLm9yZGVyXSA9IGdyaWQuc29ydC5maWVsZDtcclxuICAgICAgICAgICAgICAgIHVybF9wYXJhbXNbbWFwcGluZ3MuZmlsdGVyc10gPSBuZy50b0pzb24oZmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRpY1BhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgIG5nLmV4dGVuZCh1cmxfcGFyYW1zLCBzdGF0aWNQYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB1cmxfcGFyYW1zO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBmaWx0ZXIoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzU3VibWl0dGFibGVFdmVudChlKSAmJiAhZ3JpZC5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnNjb3BlLiRicm9hZGNhc3QoZXZlbnRzLmZpbHRlcnNDaGFuZ2VkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnM6IGdyaWQuZmlsdGVycyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZ3JpZC5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnBhZ2luYXRlKGV2ZW50cy5maWx0ZXJzQ2hhbmdlZCwgeydldmVudCc6IGUsIGZpbHRlcnM6IGdyaWQuZmlsdGVycywgZ3JpZDogZ3JpZC5uYW1lfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyRmlsdGVycyhlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTdWJtaXR0YWJsZUV2ZW50KGUpICYmICFncmlkLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBncmlkLmZpbHRlcnMgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIF9vbkdyaWRFeHRlcm5hbGx5Q2hhbmdlZChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5uYW1lID09PSBwYXJhbXMubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5nLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2ZpbHRlcnMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmlsdGVycyA9IE9iamVjdC5rZXlzKGdyaWRba2V5XSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RmlsdGVycyA9IE9iamVjdC5rZXlzKHZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gZmlsdGVycy5kaWZmKG5ld0ZpbHRlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpZmYubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBkZWxldGVkIGluIGRpZmYpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaWZmLmhhc093blByb3BlcnR5KGRlbGV0ZWQpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGdyaWRba2V5XVtkaWZmW2RlbGV0ZWRdXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmcuaXNPYmplY3QodmFsdWUpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmcuZm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHByb3AsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmcuaXNTdHJpbmcocHJvcCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRba2V5XVtpXSA9IHByb3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmcuaXNTdHJpbmcodmFsdWUpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZFtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIF93YXRjaEdyaWRTb3J0KG4sIG8pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc09yZGVyQ2hhbmdlZChuLCBvKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5nLmV4dGVuZChuLCB7bmFtZTogZ3JpZC5uYW1lfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnNjb3BlLiRicm9hZGNhc3QoZXZlbnRzLnNvcnRDaGFuZ2VkLCBuKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMucGFnaW5hdGUoZXZlbnRzLnNvcnRDaGFuZ2VkLCB7J25ldyc6IG4sICdvbGQnOiBvfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIF93YXRjaEdyaWRQYWdpbmF0aW9uKG4sIG8pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1BhZ2VDaGFuZ2VkKG4sIG8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmcuZXh0ZW5kKG4sIHtuYW1lOiBncmlkLm5hbWV9KTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMuc2NvcGUuJGJyb2FkY2FzdChldmVudHMucGFnaW5hdGlvbkNoYW5nZWQsIG4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy5wYWdpbmF0ZShldmVudHMucGFnaW5hdGlvbkNoYW5nZWQsIHsnbmV3JzogbiwgJ29sZCc6IG99KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gX3dhdGNoR3JpZEZpbHRlcnMobiwgbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNyaXBHcmlkQ29uZmlnLnVwZGF0ZU9uRmlsdGVyQ2hhbmdlICYmICFuZy5lcXVhbHMobiwgbykpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByZXBhcmVGaWx0ZXJzKGZpbHRlcnMpIHtcclxuICAgICAgICAgICAgdmFyIHJldCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZmlsdGVycykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKFtrZXksIGZpbHRlcnNba2V5XV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc1N1Ym1pdHRhYmxlRXZlbnQoZXZlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50ID09PSB0cnVlIHx8XHJcbiAgICAgICAgICAgICAgICBldmVudC50eXBlID09PSAnY2xpY2snIHx8IGV2ZW50LnR5cGUgPT09ICdzdWJtaXQnIHx8XHJcbiAgICAgICAgICAgICAgICAoIGV2ZW50LnR5cGUgPT09ICdrZXlwcmVzcycgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzUGFnZUNoYW5nZWQobiwgbykge1xyXG4gICAgICAgICAgICByZXR1cm4gbiAhPT0gbyAmJiAocGFyc2VJbnQobi5wYWdlKSAhPT0gcGFyc2VJbnQoby5wYWdlKSB8fCBwYXJzZUludChuLnBlclBhZ2UpICE9PSBwYXJzZUludChvLnBlclBhZ2UpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzT3JkZXJDaGFuZ2VkKG4sIG8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG4gIT09IG8gJiYgKG4uZGlyZWN0aW9uICE9PSBvLmRpcmVjdGlvbiB8fCBuLmZpZWxkICE9PSBvLmZpZWxkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKGFuZ3VsYXIsIE9iamVjdCwgd2luZG93LmNyaXAgfHwgKHdpbmRvdy5jcmlwID0ge30pKTsiLCIoZnVuY3Rpb24gKG5nLCBjcmlwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY3JpcC5ncmlkXHJcbiAgICAgICAgLnByb3ZpZGVyKCdjcmlwR3JpZENvbmZpZycsIGNyaXBHcmlkQ29uZmlnKTtcclxuXHJcbiAgICBjcmlwR3JpZENvbmZpZy4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY3JpcEdyaWRDb25maWcoKSB7XHJcbiAgICAgICAgdmFyIHBsdWdpbnMgPSB7fSxcclxuICAgICAgICAgICAgcmVxdWVzdF9wcm9wcyA9IHNldFJlcXVlc3RNYXBwaW5ncygpLFxyXG4gICAgICAgICAgICBkZWZhdWx0X3Blcl9wYWdlID0gMTAsXHJcbiAgICAgICAgICAgIHBlcl9wYWdlID0gWzEwLCAyNSwgNTBdO1xyXG5cclxuICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xyXG5cclxuICAgICAgICBuZy5leHRlbmQoc2NvcGUsIHtcclxuICAgICAgICAgICAgZ2V0UGx1Z2luczogZ2V0UGx1Z2lucyxcclxuICAgICAgICAgICAgc2V0UGx1Z2luczogc2V0UGx1Z2lucyxcclxuICAgICAgICAgICAgZ2V0UmVxdWVzdE1hcHBpbmdzOiBnZXRSZXF1ZXN0TWFwcGluZ3MsXHJcbiAgICAgICAgICAgIHNldFJlcXVlc3RNYXBwaW5nczogc2V0UmVxdWVzdE1hcHBpbmdzLFxyXG4gICAgICAgICAgICBzZXRQZXJQYWdlT3B0aW9uczogc2V0UGVyUGFnZU9wdGlvbnMsXHJcbiAgICAgICAgICAgIHVwZGF0ZU9uRmlsdGVyQ2hhbmdlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRnZXQgPSBbJGdldF07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uICRnZXQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBnZXRQbHVnaW5zOiBnZXRQbHVnaW5zLFxyXG4gICAgICAgICAgICAgICAgZ2V0UmVxdWVzdE1hcHBpbmdzOiBnZXRSZXF1ZXN0TWFwcGluZ3MsXHJcbiAgICAgICAgICAgICAgICBnZXRQZXJQYWdlT3B0aW9uczogZ2V0UGVyUGFnZU9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBnZXREZWZhdWx0UGVyUGFnZU9wdGlvbjogZ2V0RGVmYXVsdFBlclBhZ2VPcHRpb24sXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVPbkZpbHRlckNoYW5nZTogc2NvcGUudXBkYXRlT25GaWx0ZXJDaGFuZ2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFBsdWdpbnMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwbHVnaW5zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0UGx1Z2lucyhuZXdQbHVnaW5Db25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBsdWdpbnMgPSBuZy5jb3B5KG5ld1BsdWdpbkNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXF1ZXN0TWFwcGluZ3MoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0X3Byb3BzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0UmVxdWVzdE1hcHBpbmdzKHBhZ2UsIHBlclBhZ2UsIGRpcmVjdGlvbiwgb3JkZXIsIGZpbHRlcnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RfcHJvcHMgPSB7XHJcbiAgICAgICAgICAgICAgICBwYWdlOiBwYWdlIHx8ICdwYWdlJyxcclxuICAgICAgICAgICAgICAgIHBlclBhZ2U6IHBlclBhZ2UgfHwgJ3Blci1wYWdlJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uIHx8ICdkaXJlY3Rpb24nLFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IG9yZGVyIHx8ICdvcmRlcicsXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXJzOiBmaWx0ZXJzIHx8ICdmaWx0ZXJzJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UGVyUGFnZU9wdGlvbnMoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwZXJfcGFnZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldERlZmF1bHRQZXJQYWdlT3B0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdF9wZXJfcGFnZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFBlclBhZ2VPcHRpb25zKHBlcl9wYWdlX29wdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKG5nLmlzQXJyYXkocGVyX3BhZ2Vfb3B0aW9ucykgJiYgcGVyX3BhZ2Vfb3B0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0X3Blcl9wYWdlID0gcGVyX3BhZ2Vfb3B0aW9uc1swXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwZXJfcGFnZSA9IHBlcl9wYWdlX29wdGlvbnM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwZXJfcGFnZV9vcHRpb25zIGNhbiBiZSBhcnJheSBmcm9tIGludGVnZXJzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShhbmd1bGFyLCB3aW5kb3cuY3JpcCB8fCAod2luZG93LmNyaXAgPSB7fSkpOyIsImFuZ3VsYXIubW9kdWxlKFwiY3JpcC5ncmlkLnRlbXBsYXRlc1wiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7JHRlbXBsYXRlQ2FjaGUucHV0KFwiL2NyaXAvZ3JpZC9wYWdpbmF0aW9uLmh0bWxcIixcIjx1bCBjbGFzcz1cXFwicGFnaW5hdGlvblxcXCI+XFxyXFxuICAgIDxsaSBuZy1pZj1cXFwiOjpib3VuZGFyeUxpbmtzXFxcIlxcclxcbiAgICAgICAgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9QcmV2aW91cygpfVxcXCJcXHJcXG4gICAgICAgIGNsYXNzPVxcXCJwYWdpbmF0aW9uLWZpcnN0XFxcIj5cXHJcXG4gICAgICAgIDxhIGhyZWYgbmctY2xpY2s9XFxcInNlbGVjdFBhZ2UoMSwgJGV2ZW50KVxcXCI+e3s6OmdldFRleHQoXFwnZmlyc3RcXCcpfX08L2E+XFxyXFxuICAgIDwvbGk+XFxyXFxuXFxyXFxuICAgIDxsaSBuZy1pZj1cXFwiOjpkaXJlY3Rpb25MaW5rc1xcXCJcXHJcXG4gICAgICAgIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vUHJldmlvdXMoKX1cXFwiXFxyXFxuICAgICAgICBjbGFzcz1cXFwicGFnaW5hdGlvbi1wcmV2XFxcIj5cXHJcXG4gICAgICAgIDxhIGhyZWYgbmctY2xpY2s9XFxcInNlbGVjdFBhZ2UoY3JpcEdyaWRQYWdpbmF0aW9uLnBhZ2UgLSAxLCAkZXZlbnQpXFxcIj57ezo6Z2V0VGV4dChcXCdwcmV2aW91c1xcJyl9fTwvYT5cXHJcXG4gICAgPC9saT5cXHJcXG5cXHJcXG4gICAgPGxpIG5nLXJlcGVhdD1cXFwicGFnZSBpbiBwYWdlc1xcXCJcXHJcXG4gICAgICAgIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiBwYWdlLmFjdGl2ZX1cXFwiXFxyXFxuICAgICAgICBjbGFzcz1cXFwicGFnaW5hdGlvbi1wYWdlXFxcIj5cXHJcXG4gICAgICAgIDxhIGhyZWYgbmctY2xpY2s9XFxcInNlbGVjdFBhZ2UocGFnZS5udW1iZXIsICRldmVudClcXFwiPnt7cGFnZS50ZXh0fX08L2E+XFxyXFxuICAgIDwvbGk+XFxyXFxuXFxyXFxuICAgIDxsaSBuZy1pZj1cXFwiOjpkaXJlY3Rpb25MaW5rc1xcXCJcXHJcXG4gICAgICAgIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vTmV4dCgpfVxcXCJcXHJcXG4gICAgICAgIGNsYXNzPVxcXCJwYWdpbmF0aW9uLW5leHRcXFwiPlxcclxcbiAgICAgICAgPGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZShjcmlwR3JpZFBhZ2luYXRpb24ucGFnZSArIDEsICRldmVudClcXFwiPnt7OjpnZXRUZXh0KFxcJ25leHRcXCcpfX08L2E+XFxyXFxuICAgIDwvbGk+XFxyXFxuXFxyXFxuICAgIDxsaSBuZy1pZj1cXFwiOjpib3VuZGFyeUxpbmtzXFxcIlxcclxcbiAgICAgICAgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9OZXh0KCl9XFxcIlxcclxcbiAgICAgICAgY2xhc3M9XFxcInBhZ2luYXRpb24tbGFzdFxcXCI+XFxyXFxuICAgICAgICA8YSBocmVmIG5nLWNsaWNrPVxcXCJzZWxlY3RQYWdlKGNyaXBHcmlkUGFnaW5hdGlvbi50b3RhbFBhZ2VzLCAkZXZlbnQpXFxcIj57ezo6Z2V0VGV4dChcXCdsYXN0XFwnKX19PC9hPlxcclxcbiAgICA8L2xpPlxcclxcbjwvdWw+XCIpO1xuJHRlbXBsYXRlQ2FjaGUucHV0KFwiL2NyaXAvZ3JpZC9wZXItcGFnZS5odG1sXCIsXCI8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj5cXHJcXG48c2VsZWN0IGNsYXNzPVxcXCJjLXBlci1wYWdlIGZvcm0tY29udHJvbCB7e2NyaXBDbGFzc319XFxcIlxcclxcbiAgICAgICAgbmctbW9kZWw9XFxcInNlbGVjdGVkXFxcIlxcclxcbiAgICAgICAgbmctb3B0aW9ucz1cXFwic2l6ZSBhcyBzaXplIGZvciBzaXplIGluIG9wdGlvbnNcXFwiPjwvc2VsZWN0PlwiKTtcbiR0ZW1wbGF0ZUNhY2hlLnB1dChcIi9jcmlwL2dyaWQvdGguaHRtbFwiLFwiPGEgaHJlZiB0aXRsZT1cXFwie3tjcmlwVGl0bGV9fVxcXCJcXHJcXG4gICBuZy1jbGljaz1cXFwiY3JpcEdyaWRUaC5zb3J0QnkoY3JpcE5hbWUpXFxcIj5cXHJcXG4gICAgPGkgY2xhc3M9XFxcImNyaXAtaWNvbiBmYSBwdWxsLXJpZ2h0XFxcIlxcclxcbiAgICAgICBuZy1jbGFzcz1cXFwie1xcJ2ZhLXNvcnQtZGVzY1xcJzogY3JpcEdyaWRUaC5pc0Rlc2NGb3IoY3JpcE5hbWUpLFxcclxcbiAgICAgICAgICAgICAgICAgIFxcJ2ZhLXNvcnQtYXNjXFwnOiBjcmlwR3JpZFRoLmlzQXNjRm9yKGNyaXBOYW1lKX1cXFwiPjwvaT4gPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+XFxyXFxuPC9hPlwiKTt9XSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
