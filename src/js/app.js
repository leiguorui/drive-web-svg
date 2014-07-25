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

