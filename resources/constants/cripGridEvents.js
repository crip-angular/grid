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