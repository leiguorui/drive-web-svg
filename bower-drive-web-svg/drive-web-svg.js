angular.module('drive.web.svg', [
  'ui.bootstrap',
  'colorpicker.module',
  'drive.web.svg.services',
  'drive.web.svg.controllers',
  'drive.web.svg.directives'
]).run(['$templateCache', function ($templateCache) {
  $templateCache.put('partials/canvasDirective.html',
      '<div id="page-content-wrapper">' +
        <!-- Keep all page content within the page-content inset div! -->
        '<div class="page-content inset">' +
          '<div class="row">' +
            '<div class="col-md-12">' +
              '<div class="btn-toolbar" role="toolbar">' +
                '<div class="btn-group">' +
                  '<button type="button" ng-click="shapeSelecter(\'line\')" class="btn btn-default">' +
                    '<span class="glyphicon glyphicon-align-justify"></span> 直线' +
                  '</button>' +
                  '<button type="button" ng-click="shapeSelecter(\'path\')" class="btn btn-default">' +
                    '<span class="glyphicon glyphicon-paperclip"></span> 曲线' +
                  '</button>' +
                  '<button type="button" ng-click="shapeSelecter(\'ellipse\')" class="btn btn-default">' +
                    '<span class="glyphicon glyphicon-adjust"></span> 椭圆' +
                  '</button>' +
                  '<button type="button" ng-click="shapeSelecter(\'rect\')" class="btn btn-default">' +
                    '<span class="glyphicon glyphicon-th-large"></span> 矩形' +
                  '</button>' +
                '</div>' +
                '<div class="btn-group">' +
                  '<button type="button" class="btn btn-default">' +
                  '<span class="glyphicon glyphicon-pencil"></span> 画笔' +
                  '</button>' +
                  '<button type="button" class="btn btn-default">' +
                  '<span class="glyphicon glyphicon-book"></span> 橡皮' +
                  '</button>' +
                  '<button type="button" class="btn btn-default">' +
                  '<span class="glyphicon glyphicon-font"></span> 文字' +
                  '</button>' +
                '</div>' +
                '<div class="btn-group">' +
                  '<button type="button" class="btn btn-default">' +
                    '<span class="glyphicon glyphicon-circle-arrow-left"></span> 撤销' +
                  '</button>' +
                  '<button type="button" class="btn btn-default">' +
                    '<span class="glyphicon glyphicon-circle-arrow-right"></span> 重做' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" ng-click="clearSVG()">' +
                    '<span class="glyphicon glyphicon-trash"></span> 清空' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" colorpicker colorpicker-position="bottom" ng-model="stroke">' +
                    '<span class="glyphicon glyphicon-th"></span> 取色' +
                  '</button>' +
                '</div>' +
                '<div class="btn-group">' +
                  '<button type="button" class="btn btn-default">' +
                    '<span class="glyphicon glyphicon-share-alt"></span> 邀请' +
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="col-md-8">' +
              '<p class="well">' +
                '<svg id="mysvg"></svg>' +
              '</p>' +
            '</div>' +
            '<div class="col-md-4">' +
              '<p class="well">输出信息.</p>' +
            '</div>' +
            '<div class="col-md-4">' +
              '<p class="well">But the full-width layout means that you wont be using containers.</p>' +
            '</div>' +
            '<div class="col-md-4">' +
              '<p class="well">Three Column Example</p>' +
            '</div>' +
            '<div class="col-md-4">' +
              '<p class="well">Three Column Example</p>' +
            '</div>' +
            '<div class="col-md-4">' +
              '<p class="well">You get the idea! Do whatever you want in the page content area!</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>');
}]);


'use strict';

/* Controllers */

angular.module('drive.web.svg.controllers', ['drive.web.svg.services'])
    .controller('SVGController', ['$scope', '$window','graphService', 'realtimeService', 'goodowConstant', '$log',
      function ($scope, $window,graphService, realtimeService, goodowConstant, $log) {
      var store = realtimeService();
      var rtpg = rtpg || {};
      rtpg.realtimeDoc = null;

      rtpg.list = rtpg.list || {};
      rtpg.list.FIELD_NAME = 'data';
      rtpg.list.field = null;
      rtpg.list.START_VALUE = [];

      rtpg.map = rtpg.map || {};

      rtpg.initializeModel = function (model) {
        rtpg.list.initializeModel(model);
      };

      rtpg.onFileLoaded = function (doc) {
        window.doc = doc;

        rtpg.realtimeDoc = doc;
        rtpg.list.loadField();
        rtpg.list.connectRealtime(doc);
        rtpg.list.connectUi();
      };

      rtpg.handleErrors = function (e) {
        if (e.type == realtime.store.ErrorType.TOKEN_REFRESH_REQUIRED) {
          alert("TOKEN_REFRESH_REQUIRED");
        } else if (e.type == realtime.store.ErrorType.CLIENT_ERROR) {
          alert("An Error happened: " + e.message);
          window.location.href = "/";
        } else if (e.type == realtime.store.ErrorType.NOT_FOUND) {
          alert("The file was not found. It does not exist or you do not have read access to the file.");
          window.location.href = "/";
        }
      };

      rtpg.list.loadField = function () {
        rtpg.list.field = rtpg.realtimeDoc.getModel().getRoot().get(rtpg.list.FIELD_NAME);
      };

      rtpg.list.initializeModel = function (model) {
        var field = model.createList();
        field.pushAll(rtpg.list.START_VALUE);
        model.getRoot().set(rtpg.list.FIELD_NAME, field);
      };

      rtpg.list.onRealtimeAdded = function (evt) {
        rtpg.list.connectUi();
      };

      rtpg.list.onRealtimeRemoved = function (evt) {
        graphService.clearGraph();
        rtpg.list.connectUi();
      };

      rtpg.list.onRealtimeSet = function (evt) {
        alert("onRealtimeSet");
      };

      rtpg.list.connectRealtime = function () {
        rtpg.list.field.onValuesAdded(rtpg.list.onRealtimeAdded);
        rtpg.list.field.onValuesRemoved(rtpg.list.onRealtimeRemoved);
        rtpg.list.field.onValuesSet(rtpg.list.onRealtimeSet);
      };

      //转换接收到的数据
      rtpg.list.connectUi = function(){
        var array = rtpg.list.field.asArray();
        for (var i = 0, len = array.length; i < len; i++) {
          var listItem = array[i].toJson();
          listItem.stroke = "black"; //web svg不支持数字颜色-65536
          listItem.fill = "none";
          switch (listItem.type) {
            case "line":
              var pathData = listItem.d;
              for(var n = 0; n < pathData.length; n++){
                pathData[n] = [pathData[n][0]*500,pathData[n][1]*800];
              }
              listItem.d = pathData;
              $scope.$apply(function ($scope) {
                $scope.data = {"path": listItem};
              });
              break;
            case "path":
              var pathData = listItem.d;
              for(var n = 0; n < pathData.length; n++){
                pathData[n] = [pathData[n][0]*500,pathData[n][1]*800];
              }
              listItem.d = pathData;
              $scope.$apply(function ($scope) {
                $scope.data = {"path": listItem};
              });
              break;
            case "rect":
              listItem.x = listItem.x*500;
              listItem.y = listItem.y*800;
              listItem.width = listItem.width*500;
              listItem.height = listItem.height*800;
              $scope.$apply(function ($scope) {
                $scope.data = {"rect": listItem};
              });
              break;
            case "ellipse":
              listItem.cx = listItem.cx*500;
              listItem.cy = listItem.cy*800;
              listItem.rx = listItem.rx*500;
              listItem.ry = listItem.ry*800;
              $scope.$apply(function ($scope) {
                $scope.data = {"ellipse": listItem};
              });
              break;
          }
        }
      }

      //转化要发送的数据
      rtpg.list.converteToMap = function(sendData){
        //数据放在map中，否则数据转换错误
        var map = ({"fill": 0, "stroke": -65536, "stroke_width": 3, "rotate": 0});
        for (var p in sendData) {
          switch (p) {
            case "path":
              var pathData = sendData[p].d;
              var dataList = rtpg.realtimeDoc.getModel().createList();
              for(var n = 0; n < pathData.length; n++){
                dataList.push([(pathData[n][0]+0.1)/500,(pathData[n][1]+0.1)/800]); //转为double型
              }
              map.d = dataList; //anrdoid方面，d需要list
              map.type = dataList.length == 2?"line":"path";
              break;
            case "rect":
              var lineData = sendData[p];
              map.x = lineData.x/500;
              map.y = lineData.y/800;
              map.width = lineData.width/500;
              map.height = lineData.height/800;
              map.type = "rect";
              break;
            case "ellipse":
              var ellipseData = sendData[p];
              map.cx = ellipseData.cx/500;
              map.cy = ellipseData.cy/800;
              map.rx = ellipseData.rx/500;
              map.ry = ellipseData.ry/800;
              map.type = "ellipse";
              break;
          }
        }

        var dataMap = rtpg.realtimeDoc.getModel().createMap(map);
        for (var key in map) {
          dataMap.set(key, map[key]);
        }
        return dataMap;
      }

      store.load("svg/5", rtpg.onFileLoaded, rtpg.initializeModel, rtpg.handleErrors);

      //发送数据
      $scope.$watch('sendData', function () {
        if ($scope.sendData) {
          rtpg.list.field.push(rtpg.list.converteToMap($scope.sendData));
        }
      });

      //清空数据
      $scope.clearSVG = function(){
        rtpg.realtimeDoc.getModel().getRoot().get('data').clear();
      }

      //设置图形
      $scope.shapeSelecter = function(shape){
        $scope.shape = shape;
      }

    }])
    .controller("ModalDemoCtrl",["$scope","$modal","$log",function($scope, $modal, $log){
      $scope.items = ['item1', 'item2', 'item3'];

      $scope.open = function (size) {

        var modalInstance = $modal.open({
          templateUrl: 'myModalContent.html',
          controller: ModalInstanceCtrl,
          size: size,
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

        $scope.items = items;
        $scope.selected = {
          item: $scope.items[0]
        };

        $scope.ok = function () {
          $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };
    }]);

/**
 * Created by leiguorui on 14-7-15.
 */

/* Directives */

angular.module('drive.web.svg.directives', ['drive.web.svg.services'])
    .directive('goodowcanvas', ['realtimeService', 'goodowConstant', 'graphService', function (realtimeService, goodowConstant, graphService) {
  // d3 linear generator
  var lineFunction = graphService.lineFunction();
  //invoked when mousedown init,what will be inserted into SVG element,use default config
  var initDrawPen = function (config) {
    var myCanvas = d3.select('#mysvg').append('g');
    var graph = myCanvas.append(config.type)
        .attr('fill', config.fill)
        .attr('stroke', config.stroke)
        .attr('stroke-width', config.stroke_width)
        .attr('stroke-dasharray', config.stroke_dasharray)
        .attr('stroke-linecap', "round");
    return graph;
  };

  //will be invoked when Mouse up,fill the graph use comstom config
  function paint(d3ele, configuration) {
    var self_ = this;
    if (configuration.type == 'rect') {
      d3ele.attr('width', configuration.width)
          .attr('height', configuration.height)
          .attr('x', configuration.startX)
          .attr('y', configuration.startY);
    } else if (configuration.type == 'ellipse') {
      d3ele.attr('rx', configuration.rx)
          .attr('ry', configuration.ry)
          .attr('cx', configuration.startX)
          .attr('cy', configuration.startY);
    } else if (configuration.type == 'path') {
      d3ele.attr('d', lineFunction(configuration.d));
    }

  }


  var link = function (scope, element, attr) {
    //mouse move default config
    var defaultConfig = {
      'fill': 'none',
      'stroke': 'blue',
      'stroke_width': 1,
      'stroke_dasharray': '1,2',
      canDraw: false,
      hasDrawFinish: true
    }


    // var ellipseConfig = angular.extend({},defaultConfig);
    var configuration;
    configuration = angular.extend({}, defaultConfig);
    configuration.d = [];

    scope.$watch('data', function () {
      var data = scope.data;
      var configuration_;
      for (var p in data) {
        configuration_ = angular.extend({}, data[p]);
        configuration_.type = p;
        graphService.drawGraph(configuration_);
      }
    });

    //
    var ellipse, rect, path, line;

//		BindAction
    //DOM element
    var svgElement = element.find('svg')[0];

    d3.select(svgElement).on('click', function () {
      var self_ = this;
      if (scope.shape == 'line') {
        if (configuration.d.length == 0) {
          configuration.type = 'path';
          configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
          configuration.canDraw = true;
          configuration.hasDrawFinish = false;
          line = initDrawPen(configuration);
        } else {
          d3.select(self_).attr('style', 'cursor:default');
          configuration.canDraw = false;
          configuration.hasDrawFinish = true;
          var sendData = {};
          var path_stroke_width = (scope.stroke_width == undefined || scope.stroke_width == 0) ? 1 : scope.stroke_width;
          var path_stroke = scope.stroke == undefined ? 'black' : scope.stroke;
          line.attr('d', lineFunction(configuration.d))
              .attr('stroke-width', path_stroke_width)
              .attr('stroke', path_stroke)
              .attr('fill', 'none')
              .attr('stroke-dasharray', '');
          sendData.path = {};
          sendData.path['d'] = configuration.d;
          sendData.path['fill'] = scope.fill;
          sendData.path['stroke'] = path_stroke;
          sendData.path['stroke-width'] = path_stroke_width;

          scope.$apply(function (scope) {
            scope.sendData = sendData;
            console.log(JSON.stringify(sendData));
          });
          configuration = angular.extend({}, defaultConfig);
          configuration.d = [];
        }
      }
      d3.select(self_).on('mousemove', function () {
        if (!configuration.canDraw)
          return;
        d3.select(this).attr('style', 'cursor:crosshair');
        configuration.d = [configuration.d[0]];
        configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
        line.attr('d', lineFunction(configuration.d));
      });
    });

    d3.select(svgElement).on('mousedown', function () {
      //DOM element
      var self_ = this;
      //left mouse down
      if (d3.event.which == 1) {
        switch (scope.shape) {
          case 'ellipse':
            configuration.type = 'ellipse';
            configuration.rx = 0;
            configuration.ry = 0;
            configuration.tempX = d3.event.offsetX;
            configuration.tempY = d3.event.offsetY;
            configuration.canDraw = true;
            configuration.hasDrawFinish = false;
            ellipse = initDrawPen(configuration);
            break;
          case 'rect':
            configuration.type = 'rect';
            configuration.width = 0;
            configuration.height = 0;
            configuration.startX = configuration.tempX = d3.event.offsetX;
            configuration.startY = configuration.tempY = d3.event.offsetY;
            configuration.canDraw = true;
            configuration.hasDrawFinish = false;
            rect = initDrawPen(configuration);
            break;
          case 'path':
            configuration.type = 'path';
            configuration.d = [];
            //
            configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
            configuration.canDraw = true;
            configuration.hasDrawFinish = false;
            path = initDrawPen(configuration);
            break;
          case 'line':
            return;

        }
      }

      d3.select(self_).on('mouseup', function () {
        var self_ = this;
        if (d3.event.which == 1) {
          d3.select(self_).attr('style', 'cursor:default');
          configuration.canDraw = false;
          configuration.hasDrawFinish = true;
          var sendData = {};
          if (configuration.type == 'rect') {
            rect.attr('fill', scope.fill)
                .attr('stroke-width', scope.stroke_width)
                .attr('stroke', scope.stroke)
                .attr('stroke-dasharray', '');
            sendData.rect = {};
            sendData.rect['x'] = configuration.startX;
            sendData.rect['y'] = configuration.startY;
            sendData.rect['width'] = configuration.width;
            sendData.rect['height'] = configuration.height;
            sendData.rect['fill'] = scope.fill;
            sendData.rect['stroke'] = scope.stroke;
            sendData.rect['stroke-width'] = scope.stroke_width;
          } else if (configuration.type == 'ellipse') {
            ellipse.attr('fill', scope.fill)
                .attr('stroke-width', scope.stroke_width)
                .attr('stroke', scope.stroke)
                .attr('stroke-dasharray', '');
            sendData.ellipse = {};
            sendData.ellipse['cx'] = configuration.startX;
            sendData.ellipse['cy'] = configuration.startY;
            sendData.ellipse['rx'] = configuration.rx;
            sendData.ellipse['ry'] = configuration.ry;
            sendData.ellipse['fill'] = scope.fill;
            sendData.ellipse['stroke'] = scope.stroke;
            sendData.ellipse['stroke-width'] = scope.stroke_width;
          } else if (configuration.type == 'path') {
            console.log(JSON.stringify(configuration.d));
            var path_stroke_width = (scope.stroke_width == undefined || scope.stroke_width == 0) ? 1 : scope.stroke_width;
            var path_stroke = scope.stroke == undefined ? 'black' : scope.stroke;
            path.attr('d', lineFunction(configuration.d))
                .attr('stroke-width', path_stroke_width)
                .attr('stroke', path_stroke)
                .attr('fill', 'none')
                .attr('stroke-dasharray', '');
            sendData.path = {};
            sendData.path['d'] = configuration.d;
            sendData.path['fill'] = scope.fill;
            sendData.path['stroke'] = path_stroke;
            sendData.path['stroke-width'] = path_stroke_width;
          }

        }
//                 realtimeService.publish(goodowConstant.SVG_SID,sendData);
        scope.$apply(function (scope) {
          scope.sendData = sendData;
        });
        d3.select(self_).on('mousemove', null).on('mouseup', null);
      }).on('mousemove', function () {
        if (!configuration.canDraw)
          return;
        var self_ = this;
        d3.select(self_).attr('style', 'cursor:crosshair');
        var endX = d3.event.offsetX;
        var endY = d3.event.offsetY;
        if (configuration.type == 'rect') {
          configuration.width = endX - configuration.tempX;
          configuration.height = endY - configuration.tempY;
          if (configuration.width < 0) {
            configuration.startX = endX;
            configuration.width = Math.abs(configuration.width);
          }
          if (configuration.height < 0) {
            configuration.startY = endY;
            configuration.height = Math.abs(configuration.height);
          }
          paint(rect, configuration);
        } else if (configuration.type == 'ellipse') {
          configuration.rx = Math.abs(endX - configuration.tempX) / 2;
          configuration.ry = Math.abs(endY - configuration.tempY) / 2;
          configuration.startX = configuration.tempX + (endX - configuration.tempX) / 2;
          configuration.startY = configuration.tempY + (endY - configuration.tempY) / 2;
          paint(ellipse, configuration);
        } else if (configuration.type == 'path') {
          configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
          path.attr('d', lineFunction(configuration.d));
        }
        //reset configuration
        // configuration = null;
      });
    });
    //destory handler
    element.on('$destroy', function () {
      //close connnection
      realtimeService.close();
    });
  }

  return {
    restrict: 'E',
    controller: 'SVGController',
    'link': link,
    templateUrl: 'partials/canvasDirective.html'
  }
}]);

/**
 * Services
 * Create on 7.7.2014
 */

var serviceModule;
// Demonstrate how to register services
// In this case it is a simple value service.
(function (window, angular, undefined) {

  serviceModule = angular.module('drive.web.svg.services', [])
      .factory('goodowConstant', function () {
        return {
          SVG_SID: 'someaddress.s',
          SERVER: 'http://realtime.goodow.com:1986/channel'
        }
      })
      .factory('realtimeService', ['goodowConstant', function (goodowConstant) {
        return function () {
          window.store = new realtime.store.StoreImpl(goodowConstant.SERVER, null);
          return store;
        }
      }])
      .factory('goodowUtil', function () {
        function transform(element, value) {
          element.style('-webkit-transform', value)
              .style('-moz-transform', value)
              .style('-o-transform', value)
              .style('transform', value);
        }

        return {
          'transform': transform
        };
      })
      .factory('graphService', ['goodowUtil', function (goodowUtil) {
        var linefn = d3.svg.line()
            .x(function (d) {
              return d[0];
            })
            .y(function (d) {
              return d[1];
            })
            .interpolate('linear');
        var svgHeight = null;
        var svgWidth = null;
        var rectGenerator = function (config, svgElement) {
          //Really needed?
          if (config.type !== 'rect')
            return;
//              var linear_scale_y = d3.scale.linear().range([0,svgHeight]).domain([0,config.y]);
//              var linear_scale_x = d3.scale.linear().range([0,svgWidth]).domain([0,config.x]);
          var rect = svgElement.append('g').append('rect');
          rect.attr('fill', config.fill)
              .attr('stroke', config.stroke)
              .attr('stroke-width', config['stroke-width'])
              .attr('stroke-linecap', "round");
//              rect.attr('x',linear_scale_x(config.x))
//                  .attr('y',linear_scale_y(config.y))
          rect.attr('x', config.x)
              .attr('y', config.y)
              .attr('width', config.width)
              .attr('height', config.height);
          if (config.transform) {
            goodowUtil.transform(rect, 'rotate(' + config.transform.rotate + 'deg)');
          }

        };

        var ellipseGenerator = function (config, svgElement) {
          var ellipse = svgElement.append('g').append('ellipse');
          ellipse.attr('fill', config.fill)
              .attr('stroke', config.stroke)
              .attr('stroke-width', config['stroke-width'])
              .attr('stroke-linecap', "round");
          ellipse.attr('cx', config.cx)
              .attr('cy', config.cy)
              .attr('rx', config.rx)
              .attr('ry', config.ry);
          if (config.transform) {
//                      ellipse.style('-webkit-transform', 'rotate(' + config.transform.rotate + 'deg)')
//                          .style('-moz-transform', 'rotate(' + config.transform.rotate + 'deg)')
//                          .style('-o-transform', 'rotate(' + config.transform.rotate + 'deg)')
//                          .style('transform', 'rotate(' + config.transform.rotate + 'deg)');
            goodowUtil.transform(ellipse, 'rotate(' + config.transform.rotate + 'deg)');
          }
        }

        var pathGenerator = function (config, svgElement) {
          var path = svgElement.append('g').append('path');
          path.attr('stroke', config.stroke)
              .attr('stroke-width', config['stroke-width'])
              .attr('fill', 'none')
              .attr('stroke-linecap', "round");
          if (angular.isArray(config.d) && config.d.length >= 2) {
            path.attr('d', linefn(config.d));
          }
          if (config.transform) {
            goodowUtil.transform(path, 'rotate(' + config.transform.rotate + 'deg)');
          }
        }
        var factoryMap = {
          'ellipse': ellipseGenerator,
          'path': pathGenerator,
          'rect': rectGenerator
          //...
        }


        //CanvasElement
        return {
          //通过数据画出图形
          drawGraph: function (config) {
            var fn = factoryMap[config.type];
            var svgElement = d3.select('#mysvg');
            svgHeight = svgElement.property('height').animVal.value;
            svgWidth = svgElement.property('width').animVal.value;

            if (angular.isFunction(fn)) {
              fn.call(null, config, svgElement);
            } else {
              throw new Error(fn + ' is not a function');
            }
          }
          //d3 api  line gengerator 统一由service提供
          , lineFunction: function (name) {
            return linefn;
          }
          , clearGraph: function () {
            d3.selectAll("svg > *").remove();
          }
        }

      }]);
})(window, angular);
