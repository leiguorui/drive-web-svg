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

        d3.select(self_).on('mousemove', function () {
          if (!configuration.canDraw)
            return;
          d3.select(this).attr('style', 'cursor:crosshair');
          configuration.d = [configuration.d[0]];
          configuration.d.push([d3.event.offsetX, d3.event.offsetY]);
          line.attr('d', lineFunction(configuration.d));
        });
      }else if(scope.shape == 'text') {
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
        var fill = scope.fill == undefined ? 'none' : scope.fill; //填充默认为透明
        var stroke = scope.stroke == undefined ? 'black' : scope.stroke; //边框默认为黑色
        if (d3.event.which == 1) {
          d3.select(self_).attr('style', 'cursor:default');
          configuration.canDraw = false;
          configuration.hasDrawFinish = true;
          var sendData = {};
          if (configuration.type == 'rect') {
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
          } else if (configuration.type == 'ellipse') {
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
