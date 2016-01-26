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