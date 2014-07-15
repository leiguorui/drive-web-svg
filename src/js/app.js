angular.module('drive.web.svg', [
  'drive.web.svg.services',
  'drive.web.svg.controllers',
  'drive.web.svg.directives'
]).run(['$templateCache', function ($templateCache) {
  $templateCache.put('partials/canvasDirective.html', '<div class="nav" id="draw_menu" >' +
      '<input type="radio" name="path" ng-model="shape" value="line"/>  zhi' +
      '<input type="radio" name="path" ng-model="shape" value="path2"/> jian' +
      '<input type="radio" name="path" ng-model="shape" value="path3"/> qu' +
      '<input type="radio" name="path" ng-model="shape" value="path4"/>  zhe' +
      '<input type="radio" name="path" ng-model="shape" value="path5"/> hu' +
      '<input type="radio" name="path" ng-model="shape" value="path"/> ziyou' +
      '<input type="radio"  ng-model="shape" value="rect"/>  juxing' +
      '<input type="radio"  ng-model="shape" value="ellipse"/> tuoyuan' +
      '<input type="text" name="basic" ng-model="stroke" id="border_color"/>RGB or name ：边框颜色' +
      '<input type="text" name="basic" ng-model="fill" id="fill_color"/>RGB or name :填充颜色' +
      '<input type="text" name="basic" ng-model="stroke_width" id="border_width"/>Number' +
      '<button ng-click="clearSVG()">清空</button>' +
      '</div><svg id="mysvg"></svg>');
}]);
