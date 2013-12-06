/*
Copyright 2013 Weswit s.r.l.

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

define(["./AxisControl"], function(AxisControl) {
  
  var rightLeft = new AxisControl(39,37);
  var upDown = new AxisControl(40,38);
  var startUpBeta = null;
  var startUpGamma = null;
  
  var idle = true;
  var activeEvents = false;

  return {
    startListening: function() {
      
      idle = false;
      if (window.DeviceOrientationEvent && !activeEvents) {
        activeEvents = true;
        
        window.addEventListener('deviceorientation', function(eventData) {
          if (idle) {
            return;
          }
          if (startUpBeta === null) {
            startUpBeta = eventData.beta;
            startUpGamma = eventData.gamma;
          }
          
          if(eventData.gamma > startUpGamma+10) {
            rightLeft.goOne();      
          } else if(eventData.gamma < startUpGamma-10) {
            rightLeft.goTwo();
          } else { //== 0
            rightLeft.stop();
          }
          
          if (eventData.beta > startUpBeta+10) {
            upDown.goOne();
          } else if (eventData.beta < startUpBeta-10) {
            upDown.goTwo();
          } else { // startUp >= beta >= startUp
            upDown.stop();
          }
          
        }, false);
      } 
    },
    stopListening: function() {
      upDown.stop();
      rightLeft.stop();
      idle = true;
    }
  };
  
});