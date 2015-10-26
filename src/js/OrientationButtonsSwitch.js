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

define(function() {
  

  function addEvent(evnt, obj, handler){ 
    if (obj.addEventListener) {
      obj.addEventListener(evnt, handler, false);
    } else {
      obj.attachEvent("on"+evnt, handler);
    }
  }
  
  var OrientationButtonsSwitch = function(orientation,buttons,startupVal) {
    this.accelerometer = startupVal;
    this.orientation = orientation;
    this.buttons = buttons;
    
   
  };
  
  OrientationButtonsSwitch.prototype = {
      
    isOrientationActive: function() {
      return this.accelerometer;
    },
  
    switchTo: function(newV) {
      this.accelerometer = newV;
      if(this.accelerometer) {
        this.orientation.startListening();
        this.buttons.stopListening();
      } else {
        this.orientation.stopListening();
        this.buttons.startListening();
      }
    },
    
    stopListening: function() {
      if(this.accelerometer) {
        this.orientation.stopListening();
      } else {
        this.buttons.stopListening();
      }
    },
    
    startListening: function() {
      this.switchTo(this.accelerometer);
    }
    
  };
  
  return OrientationButtonsSwitch;
  
});