app = angular.module("share", []);
app.controller('ShareController', function($scope){
    $scope.share = {};
    $scope.results = [];


    window.addEventListener('DOMContentLoaded', function () {
      $scope.sendMessage();
    });

    chrome.runtime.onMessage.addListener(function (msg, sender, response) {
      console.log(msg);
      if(msg.action && msg.action === 'record_captured'){
        $scope.$apply(function(){
          $scope.share = msg.stock;
        });
      }
    });

    $scope.sendMessage = function(){
      console.log("refresh");
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        console.log(activeTab);
        chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
      });
    };
});

app.directive('camarillachart', camarillachart);

function camarillachart() {
    var directive = {
        restrict: 'C',
        template: '<h3>{{current_points.date}}</h3><div class="camarilla_scanner" ng-style="{width:width, height:height}">'+
      '<div class="line" ng-repeat="li in lines" ng-class="li.class" ng-style="{bottom:li.pos}"></div>'+
      '<label class="chart_label" ng-repeat="li in lines" ng-class="li.class" ng-style="{bottom:li.pos-6}">{{li.label}}</label>'+
      '<label class="chart_points" ng-repeat="li in lines" ng-class="li.class" ng-style="{bottom:li.pos-6}">{{li.points}}</label>'+
      '<div ng-repeat="li in active_position" class="active_points p{{$index+1}}" ng-style="{bottom:li.bottom, left:li.left}" title="{{li.points}}"></div>'+
      '<div class="open" ng-style="{width:open.distance, transform: open.angle, left: open.left, bottom:open.bottom}"></div>'+
      '<div class="middle" ng-style="{width:middle.distance, transform: middle.angle, left: middle.left, bottom:middle.bottom}"></div>'+
      '<div class="end" ng-style="{width:end.distance, transform: end.angle, left: end.left, bottom:end.bottom}"></div>'+
    '</div>',
        link: function($scope, element, attrs) {
          $scope.previous_points = JSON.parse(attrs.previous);
          $scope.current_points = JSON.parse(attrs.current);
          $scope.width = parseInt(attrs.width);
          $scope.height = parseInt(attrs.height);

          if($scope.current_points.high-$scope.current_points.close > $scope.current_points.close - $scope.current_points.low){
            $scope.allpoints = [$scope.current_points.open, $scope.current_points.high, $scope.current_points.low, $scope.current_points.close];
          } else {
            $scope.allpoints = [$scope.current_points.open, $scope.current_points.low, $scope.current_points.high, $scope.current_points.close];
          }

          $scope.points = {};
          $scope.diff = $scope.previous_points.high-$scope.previous_points.low;
          $scope.points.r6 = (1.0076*$scope.diff)+$scope.previous_points.close;
          $scope.points.r5 = (0.8244*$scope.diff)+$scope.previous_points.close;
          $scope.points.r4 = (0.555*$scope.diff)+$scope.previous_points.close;
          $scope.points.r3 = (0.275*$scope.diff)+$scope.previous_points.close;
          $scope.points.r2 = (0.183*$scope.diff)+$scope.previous_points.close;
          $scope.points.r1 = (0.0916*$scope.diff)+$scope.previous_points.close;
          $scope.points.s1 = $scope.previous_points.close-(0.0916*($scope.diff));
          $scope.points.s2 = $scope.previous_points.close-(0.183*($scope.diff));
          $scope.points.s3 = $scope.previous_points.close-(0.275*($scope.diff));
          $scope.points.s4 = $scope.previous_points.close-(0.55*($scope.diff));
          $scope.points.s5 = $scope.previous_points.close-(0.8244*($scope.diff));
          $scope.points.s6 = $scope.previous_points.close-(1.0992*($scope.diff));
          $scope.points.pp = ($scope.points.r1 + $scope.points.s1 ) / 2;

          angular.forEach($scope.points, function(v,k){
            $scope.allpoints.push(v);
          });

          var max = $scope.allpoints.reduce(function(a, b) {
              return Math.max(a, b);
          });

          var min = $scope.allpoints.reduce(function(a, b) {
              return Math.min(a, b);
          });

          $scope.min = min - 2;
          $scope.max = max + 2;

          $scope.lines = [];
          angular.forEach($scope.points, function(v,k){
            v = v.toFixed(2);
            var pos = (v - $scope.min)/($scope.max - $scope.min) * 100;
            $scope.lines.push({pos:($scope.height * pos/100), points: v, label:k === 'pp' ?'' : k.toUpperCase(), class:k});
          });

          $scope.active_position = [];

          angular.forEach($scope.allpoints, function(v,k){
            v = v.toFixed(2);
            if(k < 4){
              var pos = (v - $scope.min)/($scope.max - $scope.min) * 100;
              $scope.active_position.push({pos:($scope.height * pos/100), points: v, left: ($scope.width*(20+(k*16))/100)-3.5, bottom: ($scope.height * pos/100)-3.5});
            }
          });

          function getAngleDistance(x1,x2,y1,y2){

            var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            var a = x1 - x2;
            var b = y1 - y2;
            var distance = Math.sqrt( a*a + b*b );

            return {angle: 'rotate('+(-angle)+'deg)', distance:distance, left: x1, bottom:y1};
          };

          $scope.open = getAngleDistance($scope.width*20/100,$scope.width*36/100,
            $scope.active_position[0].pos,$scope.active_position[1].pos);
          $scope.middle = getAngleDistance($scope.width*36/100,$scope.width*52/100,
            $scope.active_position[1].pos,$scope.active_position[2].pos);
          $scope.end = getAngleDistance($scope.width*52/100,$scope.width*68/100,
            $scope.active_position[2].pos,$scope.active_position[3].pos);

        }

    };
    return directive;

    
}