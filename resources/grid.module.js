(function (ng, crip) {
    'use strict';

    crip.grid = ng.module('crip.grid', [
        'crip.core',
        'crip.grid.templates'
    ]);

})(angular, window.crip || (window.crip = {}));