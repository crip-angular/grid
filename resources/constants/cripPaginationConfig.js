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