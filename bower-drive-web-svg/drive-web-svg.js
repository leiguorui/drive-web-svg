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
                  '<button type="button" class="btn btn-default" ng-click="shapeSelecter(\'path\')">' +
                  '<span class="glyphicon glyphicon-pencil"></span> 画笔' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" ng-click="shapeSelecter(\'eraser\')">' +
                  '<span class="glyphicon glyphicon-book"></span> 橡皮' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" ng-click="shapeSelecter(\'text\')">' +
                  '<span class="glyphicon glyphicon-font"></span> 文字' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" ng-click="shapeSelecter(\'drag\')">' +
                  '<span class="glyphicon glyphicon-move"></span> 移动' +
                  '</button>' +
                '</div>' +
                '<div class="btn-group">' +
                  '<button type="button" class="btn btn-default" ng-disabled="undoButtonStatus" ng-click="doAction(\'undo\')">' +
                    '<span class="glyphicon glyphicon-circle-arrow-left"></span> 撤销' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" ng-disabled="redoButtonStatus" ng-click="doAction(\'redo\')">' +
                    '<span class="glyphicon glyphicon-circle-arrow-right"></span> 重做' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" ng-click="clearSVG()">' +
                    '<span class="glyphicon glyphicon-trash"></span> 清空' +
                  '</button>' +
                  '<button type="button" class="btn btn-default" colorpicker colorpicker-position="bottom" style="background-color: {{stroke}};" ng-model="stroke">' +
                    '<span class="glyphicon glyphicon-th"></span> 取色' +
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
              '<p class="well">画板编号：{{goodowConstant.boardId}}.</p>' +
            '</div>' +
            '<div class="col-md-4">' +
              '<p class="well">画笔颜色：{{stroke}}</p>' +
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
      $scope.undoButtonStatus = "true";
      $scope.redoButtonStatus = "true";
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

      rtpg.clear = function (para) {
        if("data" == para){
          rtpg.realtimeDoc.getModel().getRoot().get('data').clear();
        }else if("graph" == para){
          graphService.clearGraph();
        }
      };

      rtpg.onFileLoaded = function (doc) {
        window.doc = doc;

        rtpg.realtimeDoc = doc;
        rtpg.list.loadField();
        rtpg.list.connectRealtime(doc);
        rtpg.list.connectUi();

        // 重做&撤销 按钮状态
        doc.getModel().onUndoRedoStateChanged(function(e) {
          $scope.undoButtonStatus = !e.canUndo();
          $scope.redoButtonStatus = !e.canRedo();
        });
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
        rtpg.clear("graph");
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
//          listItem.stroke = "black"; //web svg不支持数字颜色-65536
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
              listItem.fill = "none";
              listItem.x = listItem.x*500;
              listItem.y = listItem.y*800;
              listItem.width = listItem.width*500;
              listItem.height = listItem.height*800;
              $scope.$apply(function ($scope) {
                $scope.data = {"rect": listItem};
              });
              break;
            case "ellipse":
              listItem.fill = "none";
              listItem.cx = listItem.cx*500;
              listItem.cy = listItem.cy*800;
              listItem.rx = listItem.rx*500;
              listItem.ry = listItem.ry*800;
              $scope.$apply(function ($scope) {
                $scope.data = {"ellipse": listItem};
              });
              break;
            case "text":
              $scope.$apply(function ($scope) {
                $scope.data = {"text": listItem};
              });
              break;
          }
        }
      }

      //转化要发送的数据
      rtpg.list.converteToMap = function(sendData){
        //数据放在map中，否则数据转换错误
        var map = ({"fill": 0, "stroke_width": 3, "rotate": 0});
        for (var p in sendData) {
          map.stroke = sendData[p].stroke;
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
            case "text":
              var textData = sendData[p];
              map.x = textData.x;
              map.y = textData.y;
              map.text = textData.text;
              map.fill = textData.fill;
              map.type = "text";
              break;
          }
        }

        var dataMap = rtpg.realtimeDoc.getModel().createMap(map);
        for (var key in map) {
          dataMap.set(key, map[key]);
        }
        return dataMap;
      }

      $scope.goodowConstant = goodowConstant;
      store.load($scope.goodowConstant.boardId, rtpg.onFileLoaded, rtpg.initializeModel, rtpg.handleErrors);
      $scope.$watch("goodowConstant.boardId", function(n,o){
        if(n != o){
          rtpg.clear("graph"); //清空画板
          store.load(n, rtpg.onFileLoaded, rtpg.initializeModel, rtpg.handleErrors);
        }
      });

      //发送数据
      $scope.$watch('sendData', function () {
        if ($scope.sendData) {
          rtpg.list.field.push(rtpg.list.converteToMap($scope.sendData));
        }
      });

      //清空数据
      $scope.clearSVG = function(){
        rtpg.clear("data");
      }

      //设置图形
      $scope.shapeSelecter = function(shape){
        if("eraser" == shape){ //TODO 这里应该再写个函数，把画笔的图形跟橡皮擦分开
          $scope.shape = "path";
          $scope.stroke_width = "10";
          $scope.stroke = "white";
        }else{
          $scope.shape = shape;
          $scope.stroke_width = null;
          $scope.stroke = null;
        }
      }

      // undo & redo
      $scope.doAction = function(doAction){
        var model = rtpg.realtimeDoc.getModel();
        if(doAction == "undo"){
          model.undo();
        }else{
          model.redo();
        }
      }
    }])
    .controller("ModalDemoCtrl",["$scope","$modal","$log","goodowConstant",function($scope, $modal, $log,goodowConstant){
      //angularjs modal 使用方法http://stackoverflow.com/questions/18935476/angularjs-ui-modal-forms
      $scope.board = {
        boardId: null,
        width: 500,
        height: 800
      };

      $scope.open = function (template) {
        var modalInstance = $modal.open({
          templateUrl: template+'.html',
          controller: ModalInstanceCtrl,
          size: '',
          resolve: {
            board: function () {
              return $scope.board;
            }
          }
        });

        modalInstance.result.then(function (board) {
          goodowConstant.setBoardId(board.boardId);
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, board) {
        $scope.boardModal = board;
        $scope.submit = function () {
          $modalInstance.close(board);
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
      if(scope.shape == 'text') {
        var svgContainer = d3.select('#mysvg').append('g');
        var text = svgContainer.append("text");
        //Add SVG Text Element Attributes
        var textLabels = text
                         .attr("x", d3.event.offsetX)
                         .attr("y", d3.event.offsetY)
                         .text("文字")
                         .attr("fill", "red");
        var sendData = {};
        sendData.text = {};
        sendData.text['x'] = d3.event.offsetX;
        sendData.text['y'] = d3.event.offsetY;
        sendData.text['text'] = "文字";
        sendData.text['fill'] = "red";

        scope.$apply(function (scope) {
          scope.sendData = sendData;
          console.log(JSON.stringify(sendData));
        });
      }else if(scope.shape == 'drag') {

      }
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
            configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
            configuration.canDraw = true;
            configuration.hasDrawFinish = false;
            path = initDrawPen(configuration);
            break;
          case 'line':
            configuration.type = 'path';
            configuration.d = [];
            configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
            configuration.canDraw = true;
            configuration.hasDrawFinish = false;
            line = initDrawPen(configuration);
            break;
        }
      }

      d3.select(self_).on('mouseup', function () {
        var self_ = this;
        var fill = scope.fill == undefined ? 'none' : scope.fill; //填充默认为透明
        var stroke = scope.stroke == undefined ? 'black' : scope.stroke; //边框默认为黑色
        if (d3.event.which == 1) {
          d3.select(self_).attr('style', 'cursor:default');
          configuration.canDraw = false;
          configuration.hasDrawFinish = true;
          var sendData = {};
          switch (scope.shape) {
            case 'ellipse':
              ellipse.attr('fill', fill)
                  .attr('stroke-width', scope.stroke_width)
                  .attr('stroke', stroke)
                  .attr('stroke-dasharray', '');
              sendData.ellipse = {};
              sendData.ellipse['cx'] = configuration.startX;
              sendData.ellipse['cy'] = configuration.startY;
              sendData.ellipse['rx'] = configuration.rx;
              sendData.ellipse['ry'] = configuration.ry;
              sendData.ellipse['fill'] = fill;
              sendData.ellipse['stroke'] = stroke;
              sendData.ellipse['stroke-width'] = scope.stroke_width;
              break;
            case 'rect':
              rect.attr('fill', fill)
                  .attr('stroke-width', scope.stroke_width)
                  .attr('stroke', stroke)
                  .attr('stroke-dasharray', '');
              sendData.rect = {};
              sendData.rect['x'] = configuration.startX;
              sendData.rect['y'] = configuration.startY;
              sendData.rect['width'] = configuration.width;
              sendData.rect['height'] = configuration.height;
              sendData.rect['fill'] = fill;
              sendData.rect['stroke'] = stroke;
              sendData.rect['stroke-width'] = scope.stroke_width;
              break;
            case 'path':
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
              break;
            case 'line':
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
              break;
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

        switch (scope.shape) {
          case 'rect':
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
            break;
          case 'ellipse':
            configuration.rx = Math.abs(endX - configuration.tempX) / 2;
            configuration.ry = Math.abs(endY - configuration.tempY) / 2;
            configuration.startX = configuration.tempX + (endX - configuration.tempX) / 2;
            configuration.startY = configuration.tempY + (endY - configuration.tempY) / 2;
            paint(ellipse, configuration);
            break;
          case 'path':
            configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
            path.attr('d', lineFunction(configuration.d));
            break;
          case 'line':
            configuration.d = [configuration.d[0]];
            configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
            line.attr('d', lineFunction(configuration.d));
            break;
        }
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
        this.SERVER = 'http://lgr.goodow.com:1986/channel';
        this.boardId = 'svg/5';
        this.setBoardId = function(id) {
          this.boardId = "svg/" + id;
        }
        return this;
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


          // Define drag beavior
          var drag = d3.behavior.drag()
              .on("drag", dragmove);

          function dragmove(d, index) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;

            d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
          }

          ellipse.style("cursor", "pointer")
              .call(drag)
              .on("mouseover", function () {
                d3.select(this).style("fill", "aliceblue");
              })
              .on("mouseout", function () {
                d3.select(this).style("fill", "none");
              });
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

        var textGenerator = function (config, svgElement) {
          var text = svgElement.append('g').append('text');
          var textLabels = text
              .attr("x", config.x)
              .attr("y", config.y)
              .text( config.text)
              .attr("fill", config.fill);

          if (config.transform) {
            goodowUtil.transform(path, 'rotate(' + config.transform.rotate + 'deg)');
          }
        }
        var factoryMap = {
          'ellipse': ellipseGenerator,
          'path': pathGenerator,
          'rect': rectGenerator,
          'text': textGenerator
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
