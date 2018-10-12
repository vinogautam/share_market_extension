angular.module('todoApp', [])
.controller('TodoListController', function($scope, $timeout) {
	$scope.company = {results:[]};
	$scope.company.name = jQuery("#companyName").text();
	$scope.company.symbol = jQuery("#symbol").text();
	console.log(jQuery("#historicalData table tr"));
	
	if(jQuery("#status1").text().indexOf('Closed') === -1){    
		$scope.company.results.push({
			date: 'Today',
			open: parseFloat(jQuery.trim(jQuery("#open").text().replace(/,/, ''))),
			high: parseFloat(jQuery.trim(jQuery("#dayHigh").text().replace(/,/, ''))),
			low: parseFloat(jQuery.trim(jQuery("#dayLow").text().replace(/,/, ''))),
			close: parseFloat(jQuery.trim(jQuery("#lastPrice").text().replace(/,/, ''))),
			volume: parseFloat(jQuery.trim(jQuery("tradedVolume").text().replace(/,/, '')))
		});
	}
	
	jQuery("#historicalData table tr").each(function(i,v){
		if(i != 0){
			$scope.company.results.push({
				date: jQuery.trim(jQuery(this).find("td:eq(0)").text()),
				open: parseFloat(jQuery.trim(jQuery(this).find("td:eq(3)").text().replace(/,/, ''))),
				high: parseFloat(jQuery.trim(jQuery(this).find("td:eq(4)").text().replace(/,/, ''))),
				low: parseFloat(jQuery.trim(jQuery(this).find("td:eq(5)").text().replace(/,/, ''))),
				close: parseFloat(jQuery.trim(jQuery(this).find("td:eq(7)").text().replace(/,/, ''))),
				volume: parseFloat(jQuery.trim(jQuery(this).find("td:eq(8)").text().replace(/,/, '')))
			});
		}
	});
	
	
	$scope.onselect = function(){
		console.log('ready');
	};
})
.directive('camarillachart', camarillachart);

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
function capture_data(){
	console.log('im here');
	jQuery("#tab8").click();
	setTimeout(function(){
		jQuery("#period").val('3months');
		setTimeout(function(){
			jQuery("#get").click();
			setTimeout(function(){
				var $injector = angular.injector(['ng', 'todoApp']);
				$injector.invoke(function($rootScope, $compile) { 
					$template = `<div class="nseCustomisation" ng-app="todoApp" ng-controller="TodoListController"><div ng-repeat="res in company.results" ng-if="$index != company.results.length -1">
  	<div class="camarillachart" current="{{company.results[$index]}}" width="350" height="350" previous="{{company.results[$index+1]}}"></div>
  </div><div id="readybutton" ng-click="onselect();"></div></div>`;
  
				$('.main_content .rhs_nav').html($compile($template)($rootScope));
				});
				
				setTimeout(function(){
					jQuery('#readybutton').trigger('click');
				}, 500);
				//chrome.runtime.sendMessage({stock: company, action: "record_captured"});
			}, 2000);
		}, 100);
	}, 100);
};

function addCamarillaStatus(){
	var previous_day = JSON.parse(localStorage.getItem('previous_day'));
	
	jQuery("#dataTable tr").each(function(i,v){
		if(i != 0){
			var res = previous_day[jQuery.trim(jQuery(this).find("td:eq(0)").text())];
			var lt = parseFloat(jQuery.trim(jQuery(this).find("td:eq(6)").text().replace(/,/, '')));
			var points = [];
			diff = res.high-res.low;
			points.push((1.0076*diff)+res.close);
			points.push((0.8244*diff)+res.close);
			points.push((0.555*diff)+res.close);
			points.push((0.275*diff)+res.close);
			points.push((0.183*diff)+res.close);
			points.push((0.0916*diff)+res.close);
			points.push(res.close-(0.0916*(diff)));
			points.push(res.close-(0.183*(diff)));
			points.push(res.close-(0.275*(diff)));
			points.push(res.close-(0.55*(diff)));
			points.push(res.close-(0.8244*(diff)));
			points.push(res.close-(1.0992*(diff)));
			console.log(points);
			var tmp_diff = points.map(function(a){return Math.abs(a-lt);});
			var min = tmp_diff.reduce(function(a, b) {
              return Math.min(a, b);
			});
			var pos = tmp_diff.indexOf(min);
			var rs = ['R6', 'R5', 'R4', 'R3', 'R2', 'R1', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
			jQuery(this).find("td:eq(1)").text(rs[pos]);
		}
	});
	
}

function check_buy(trend){
	$("#run_scan").click();
	setTimeout(function(){
    if($("#DataTables_Table_0 tbody tr .dataTables_empty").length === 0){
    	var arr = [];
	    $("#DataTables_Table_0 tbody tr").each(function(){
	      arr.push($(this).find("td:eq(2)").text());
	    });
    	var options = {
	      body: arr.join(),
	      icon: 'https://cdn0.iconfinder.com/data/icons/stock-market/512/'+trend+'_trend-512.png'
	  	};
	  	var n = new Notification(trend === 'bull' ? 'Buy' : 'Sell', options);
    }
    
    setTimeout(function(){
			check_buy(trend);
    }, 150000);
  }, 2000);
}


var href = window.location.href;
if(href.indexOf('equities_stock_watch') !== -1){
	
	setTimeout(function(){
		if(jQuery("#status1").text().indexOf('Closed') !== -1 || jQuery("#status1").text().indexOf('Pre-Open') !== -1){
			var stocks = {};
			jQuery("#dataTable tr").each(function(i,v){
				if(i != 0){
					stocks[jQuery.trim(jQuery(this).find("td:eq(0)").text())] = {
						open: parseFloat(jQuery.trim(jQuery(this).find("td:eq(3)").text().replace(/,/, ''))),
						high: parseFloat(jQuery.trim(jQuery(this).find("td:eq(4)").text().replace(/,/, ''))),
						low: parseFloat(jQuery.trim(jQuery(this).find("td:eq(5)").text().replace(/,/, ''))),
						close: parseFloat(jQuery.trim(jQuery(this).find("td:eq(6)").text().replace(/,/, '')))
					};
				}
			});
			
			localStorage.setItem('previous_day', JSON.stringify(stocks));
		}
		else {
			addCamarillaStatus();
		}
	}, 1000);
	
	
} else if(href.indexOf('GetQuote.jsp?symbol=') !== -1){
	/*chrome.runtime.onMessage.addListener(function (msg, sender, response) {
	  capture_data();
	});*/

	capture_data();
} else if(href.indexOf('vortex-and-macd-buy-signal') !== -1){
	Notification.requestPermission().then(function(result) {
		check_buy('bull');
	});
} else if(href.indexOf('vortex-and-macd-sell-signal') !== -1){
	Notification.requestPermission().then(function(result) {
		check_buy('bear');
	});
}



