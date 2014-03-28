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

var unfilteredPlayers = document.location.search.indexOf("unfiltered") > -1;
var watcher = document.location.search.indexOf("watcher") > -1;
var buttons = null;

// ###### From index_master.html

var maxBandVal = 25.25;

function updateBWInd(v) {
  if (v == maxBandVal) {
    document.getElementById("nowBandwidth").innerHTML = "unlimited";
    return;
  }

  var txt = v.toString();
  /*if (txt.indexOf(".5") <= -1) {
    document.getElementById("nowBandwidth").innerHTML = txt + ".0";
  } else {*/
    document.getElementById("nowBandwidth").innerHTML = v;
  //}
}

$(document).ready(function() {
  $("#bwslider").slider({
    animate: true,
    min: 0.25,
    max: 25.25,
    step: .25, 
    values: [ 25.25 ],
    slide: function( event, ui ) {
      updateBWInd(ui.value);
    },
    change: function(event, ui) { 
      var v = ui.value;
      updateBWInd(v);
      if (client) {
        if (ui.value == maxBandVal) {
          v = "unlimited";
        }  else {
          v = ui.value * 8;
        }
        client.connectionOptions.setMaxBandwidth(v);
      }
    }
  });
  $("#bwslider .ui-slider-handle").unbind('keydown');
  
  $.fn.qtip.styles.helpstyle = {
    background: '#FFFFFF',
    fontFamily: 'Roboto Condensed,Arial,Helvetica,sans-serif',
    color: '#999999',
    fontSize: '12px',
    textAlign: 'left',
    padding: 5,
    width: 370,
    border: {
      width: 3,
      radius: 5,
      color: '#dec972'
    },
    tip: 'topLeft'
  }
  
  $( "#Physics" ).qtip({
    content: "Pure Server-side Mode<br>- Physics runs on server side only<br>- User commands are streamed from clients to server<br>- Position updates are streamed from server to clients<br>- Clients are pure renderers (no feedback, no prediction, no interpolation)<br><br>See <a href='http://www.slideshare.net/alinone/slides-html5-devconf-20131022' target='_blank'>this slide</a> deck for more details.",
    position: { corner: { target: 'bottomMiddle', tooltip: 'topLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 600 } },
    hide: { delay: 1000 }
  });
  
  $.fn.nodoubletapzoom = function() {
    $(this).bind('touchstart', function preventZoom(e) {
      var t2 = e.timeStamp
        , t1 = $(this).data('lastTouch') || t2
        , dt = t2 - t1
        , fingers = e.originalEvent.touches.length;
      $(this).data('lastTouch', t2);
      if (!dt || dt > 500 || fingers > 1) return; // not double-tap

      e.preventDefault(); // double tap - prevent the zoom
      // also synthesize click events we just swallowed up
      $(this).trigger('click').trigger('click');
    });
  };
  
  $("#commands").nodoubletapzoom(); 
  
});
  
require(["js/login","js/Buddies","js/lsClient","js/DisplaySwitch","Subscription","StaticGrid","js/Orientation","js/KeyPad","js/OrientationButtonsSwitch","js/Buttons"], 
    function(login,Buddies,lsClient,DisplaySwitch,Subscription,StaticGrid,Orientation,KeyPad,OrientationButtonsSwitch,Buttons) {
  
  var inOutSwitch = new DisplaySwitch("loginDiv","game_div");
  inOutSwitch.show("loginDiv");
  
  var commandsSwitch = new DisplaySwitch("empty","commands");
  commandsSwitch.show("empty");
  
  var buttonsSwitch = new DisplaySwitch("empty","buttons");
  buttonsSwitch.show("empty");
  
  //var buddies = new Buddies(unfilteredPlayers,document.getElementById("iam"),document.getElementById("room_d"),true);
  var buddies = new Buddies(unfilteredPlayers,document.getElementById("bottom"),document.getElementById("room_d"),true);
      
  var buddiesSchema = ["command", "key", "nick", "msg", "usrAgnt", "posX", "posY"];

  var subBuddies = new Subscription("COMMAND","Players_list",buddiesSchema);
  if(unfilteredPlayers) {
    subBuddies.setRequestedMaxFrequency("unfiltered");
  }
  subBuddies.setRequestedSnapshot("yes");
  subBuddies.addListener(buddies);
  
  var myNick = "";
  var bandGrid = new StaticGrid("band",true);
  bandGrid.addListener({
    onVisualUpdate: function(key,info,dom) {
      if (info != null) {
        var v = info.getCellValue("currentBandwidth");
        kB = v;
        if (isNaN(kB)) {
          kB = "-.-";
        } else {
          var kB = (kB / 8) * 100; 
          kB = Math.round(kB) / 100;
        }
        info.setCellValue("currentBandwidth", kB + " kBps");
        bandGrid.updateRow(key, {currentBandwidthKB:kB + " kBps"});
      }
    }
  });
  var gBandSubs = new Subscription("MERGE");
  gBandSubs.setFields(["currentBandwidth", "currentBandwidthKB"]);
  gBandSubs.addListener(bandGrid);
  gBandSubs.addListener({onUnsubscription: function() {
      bandGrid.updateRow("My_Band_"+myNick, {currentBandwidth:"-.-"});
      bandGrid.updateRow("My_Band_"+myNick, {currentBandwidthKB:"-.-"});
    }
  });
  gBandSubs.setRequestedMaxFrequency(0.5);
  
  var loginHandler = {
      
      onLogin: function(newNick,changed) {
        myNick = newNick;
        // document.getElementById("wrap_m").style.width = "1028px";
        inOutSwitch.show("game_div");
        
        if (!watcher) {
          buddies.setOwnerNick(newNick);
          document.getElementById("iam").innerHTML = "&nbsp&nbspYou are ";
          document.getElementById("iam").appendChild(document.createTextNode(newNick+"."));
          setTimeout(function(){document.getElementById("user_msg").value = "";},100);
          
          gBandSubs.setItems(["My_Band_"+newNick]);
          lsClient.subscribe(gBandSubs);
        } else {
          document.getElementById("iam").innerHTML = "Ninja mode";
          document.getElementById("iam").style.backgroundColor = "black";
        }
        
        lsClient.subscribe(subBuddies);
        
        document.getElementById("room_d").style.borderColor = "#b0b0b0";
        document.getElementById("room_d").style.width  = "1000px"; 
        document.getElementById("room_d").style.height ="550px"; 
        
        buddies.positionBuddies();
        
        var enableAccelerometer = false;
        
        if (buttons == null ) {
          buttons = new Buttons("up","down","left","right");
        }
        
        var toTest = navigator.userAgent||navigator.vendor||window.opera;
        
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(toTest)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(toTest.substr(0,4))) {
          // enableAccelerometer = true;
          document.getElementById("keyA").style.display = "none" ;
        }
        var controlsSwitch = new OrientationButtonsSwitch(Orientation,buttons,enableAccelerometer);
        
        function addEvent(evnt, obj, handler){ 
          if (obj.addEventListener) {
            obj.addEventListener(evnt, handler, false);
          } else {
            obj.attachEvent("on"+evnt, handler);
          }
        }
        
        if (!watcher) {
          commandsSwitch.show("commands");
          controlsSwitch.startListening();
        
          if (controlsSwitch.isOrientationActive()) {
            buttonsSwitch.show("empty");
          } else {
            buttonsSwitch.show("buttons");
          }
        
          KeyPad.startListening();}
      },
      
      onLogout: function() {
        commandsSwitch.show("empty");
        inOutSwitch.show("loginDiv");
        lsClient.unsubscribe(subBuddies);
        buddies.noBuddies();
        if(!watcher) {
          buddies.setOwnerNick(null);
          lsClient.unsubscribe(gBandSubs);  
        }
        
      }
    };
    
    if (watcher) {
      loginHandler.onLogin();
    } else {
      login.init(loginHandler.onLogin,loginHandler.onLogout);
      window.login = login;
    }
    
  });

  var client = null;
  require(["js/lsClient","StatusWidget"],function(lsClient,StatusWidget) {   
  lsClient.addListener(new StatusWidget("left", "15px", false));
  
  client = lsClient;
});
  
  //###### Common to index_master.html and index.html

var lastMex = "";
function ssubmit(message) {
  if (message == lastMex) {
    return;
  }
  lastMex = message;
  var completeMex = "m|"+message;
  client.sendMessage(completeMex);
}

function setFocus() {
  require(["js/KeyPad"], function(KeyPad) {
    KeyPad.stopListening();
  });
}

function unFocus() {
  require(["js/KeyPad"], function(KeyPad) {
    KeyPad.startListening();
  });
}

function clear_input() {
  document.getElementById("user_msg").value = "";
  ssubmit("");
}

function mOver(obj) {
  obj.style.zIndex="4";
  obj.style.backgroundColor="#f1f1f1";
  obj.style.filter = "alpha(opacity=85)";
  obj.style.opacity = ".85";
}

function mOut(obj) {
  obj.style.zIndex="1";
  obj.style.backgroundColor="";
  obj.style.filter = "";
  obj.style.opacity = "";
}


