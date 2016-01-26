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