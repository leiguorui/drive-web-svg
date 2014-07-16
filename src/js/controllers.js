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
    }]);
