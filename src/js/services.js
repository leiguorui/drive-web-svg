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
//        this.SERVER = 'http://172.16.1.63:1986/channel';
        this.SERVER = 'http://krx1.retechcorp.com:1986/channel';
//        vertx runmod com.goodow.drive~drive-server~0.1.0-SNAPSHOT -conf /home/bj/workspace/drive-server/src/main/resources/drive.conf
//	      this.SERVER = 'http://lgr.goodow.com:1986/channel';
        this.boardId = 'svg/1';
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
