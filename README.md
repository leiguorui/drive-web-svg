

基于realtime-store的画板
================================

*先上 [demo](http://leiguorui.github.io/drive-web-svg/) 演示效果.*

把画板引入你的项目
------------------------

使用方法

1. 引入依赖，及编译后的文件js文件:

        <script type="text/javascript" src="bower_components/bower-sockjs-client/sockjs.min.js"></script>
        <script type="text/javascript" src="bower_components/realtime-store/realtime.store.js"></script>
        <script type="text/javascript" src="bower_components/angular/angular.js"></script>
        <script type="text/javascript" src="bower_components/angular-touch/angular-touch.js"></script>
        <script type="text/javascript" src="bower_components/d3/d3.js"></script>
        <script type="text/javascript" src="bower-drive-web-svg/drive-web-svg.js"></script>

2. 设置画板的div:

        <div ng-controller="SVGController">
            <goodowcanvas></goodowcanvas>
        </div>

需要的外部依赖
------------

<table>
  <tr>
    <th></th><th>外部依赖</th><th>作用</th>
  </tr>
  <tr>
    <td>1</td><td>realtime-store</td><td>同步每个终端的画板图形</td>
  </tr>
  <tr>
    <td>2</td><td>d3</td><td>画图</td>
  </tr>
  <tr>
    <td>2</td><td>angular</td><td>数据驱动模型</td>
  </tr>
  <tr>
    <td>2</td><td>angular-touch</td><td></td>
  </tr>
  <tr>
    <td>2</td><td>bootstrap</td><td></td>
  </tr>
  <tr>
    <td>2</td><td>angular-bootstrap</td><td></td>
  </tr>
</table>

