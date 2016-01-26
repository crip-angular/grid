# AngularJS crip grid module

For more details [see Demo repository](https://github.com/crip-angular/demo)

### Dependencies

1. AngularJS crip core module ([crip.core](https://github.com/crip-angular/core))

### Plugins

1. AngularJS crip grid url plugin ([crip.grid.url](https://github.com/crip-angular/grid-url))

### Configuration

```js
angular.module('app')
    .config(AppConfig);
    
AppConfig.$inject = ['cripGridConfigProvider'];

function AppConfig(cripGridConfigProvider) {
    // set plugins for grid module
    cripGridConfigProvider.setPlugins({});
    
    // set request variable names for grid
    cripGridConfigProvider.setRequestMappings('page', 'per-page', 'sort-direction', 'sort-field', 'filters');
    
    // set per page options
    cripGridConfigProvider.setPerPageOptions([10, 20, 50]);
}
```

### Sample of usage

JavaScript
```js
angular.module('app', ['crip.core', 'crip.grid'])
    .controller('SomeGridController', SomeGridController);

SomeGridController.$inject = ['$scope', 'cripGrid', 'SomeResource'];

function SomeGridController($scope, Grid, Resource) {
    Grid.extend({scope: $scope, paginate: loadPage, name: 'some-list'});
    
    // initialize controller
    activate();
    
    function activate() {
        $scope.someDefaults = {
            paginate: loadPage
        };

        // initially load first page
        loadPage();
    }
        
    function loadPage() {
        // prepare filter/paging parameters for request
        var params = $scope.grid.requestParams();
        
        Resource.paginate(params, function (r, headers) {
            // apply loaded data to UI and set total record count for pagination from response
            $scope.grid.setPageData(r, headers('total'));
        });
    }
}
```

HTML
```html
    <div class="table-responsive crip-grid" ng-controller="SomeGridController">
        <table class="table table-striped">
            <thead>
            <tr>
                <th crip-grid-th="grid" crip-name="id">#</th>
                <th crip-grid-th="grid" crip-name="text">Text</th>
            </tr>
            </thead>
            <tbody>
            <tr ng-repeat="item in grid.data">
                <td><span ng-bind="item.id"></span></td>
                <td><span ng-bind="item.text"></span></td>
            </tr>
            </tbody>
        </table>

        <div crip-grid-per-page="grid"></div>
        <div crip-grid-pagination="grid.pagination"></div>
    </div>
```
