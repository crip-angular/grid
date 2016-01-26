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