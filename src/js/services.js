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
