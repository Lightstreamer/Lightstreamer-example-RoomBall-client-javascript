/*
Copyright (c) Lightstreamer Srl

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

define(["./AxisControl"],function(AxisControl) {
  
  function addEvents(evnts, obj, handler){ 
    for (var i=0; i<evnts.length; i++) {
      evnt = evnts[i];
      if (obj.addEventListener) {
        obj.addEventListener(evnt, handler, false);
      } else {
        obj.attachEvent("on"+evnt, handler);
      }
    }
    
  }
  
  var STOP = true;
  var ONE = true;
  var GO = false;
  var TWO = false;
  
  var goEvents = ["mousedown","touchstart","touchenter"];
  var stopEvents = ["mouseup","touchend","touchcancel","touchleave","mouseout"];
  
  function getHandler(that,obj,isOne,isStop) {
    
    return function() {
      if (that.idle) {
        return;
      }
      
      //console.log("event - " + isStop + ", " + isOne + ", " + obj);
      
      if (isStop) {
        if (isOne) {
          obj.stopOne();
        } else {
          obj.stopTwo();
        }
      } else {
        if (isOne) {
          obj.goOne();
        } else {
          obj.goTwo();
        }
      }
    };
    
  }
  
  var Buttons = function(up,down,left,right) {
    
    var rightLeft = new AxisControl(39,37);
    var upDown = new AxisControl(38,40);
    
    this.buttons = {
        up: document.getElementById(up),
        down: document.getElementById(down),
        left: document.getElementById(left),
        right: document.getElementById(right)
    };
    
    addEvents(goEvents,this.buttons[up],getHandler(this,upDown,ONE,GO));
    addEvents(goEvents,this.buttons[down],getHandler(this,upDown,TWO,GO));
    addEvents(goEvents,this.buttons[right],getHandler(this,rightLeft,ONE,GO));
    addEvents(goEvents,this.buttons[left],getHandler(this,rightLeft,TWO,GO));
    
    addEvents(stopEvents,this.buttons[up],getHandler(this,upDown,ONE,STOP));
    addEvents(stopEvents,this.buttons[down],getHandler(this,upDown,TWO,STOP));
    addEvents(stopEvents,this.buttons[right],getHandler(this,rightLeft,ONE,STOP));
    addEvents(stopEvents,this.buttons[left],getHandler(this,rightLeft,TWO,STOP));
    
    this.stopListening();
  };
  
  Buttons.prototype = {
      startListening: function() {
        this.idle = false;
      },
      
      stopListening: function() {
        this.idle = true;
      }
  };
  
  return Buttons;
  
});