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

define(["Subscription","./lsClient"],
    function(Subscription,lsClient) {
  
  function getRandomNum() {
    var rndP = Math.random();
    rndP *= COLORS.length;
    return Math.floor(rndP)+1;
  }
  
  var HOT_FONT_SIZE = "18px";
  var COLD_FONT_SIZE = "11px";
  
  var IMG_HEIGHT = 46;
  var IMG_WIDTH = 20;
  
  var BALL_HEIGHT = 31;
  var BALL_WIDTH = 31;
 
  
  var COLORS = ["#000000","#950000","#7F3300","#757575","#7F6A00","#4CA700","#3A6E24","#009999","#004A7F","#000ED2","#57007F","#980082"];
 
   //replaces the .triangle-border:before declaration
  try {
    var styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    var style = styleEl.sheet;
    for (var i=1; i<=COLORS.length; i++) {
      var cName = ".triangle-border"+i+":before";
      //styleEl.innerHTML += cName + "{ border-color:transparent " + COLORS[i-1] + "; }\n";
      style.insertRule(cName + "{ border-color:transparent " + COLORS[i-1] + '; }', 0);
    }
  } catch(_e) {
    //we may fail
  }
 
  function addTransitionEnd(obj,event) {
    try {
      obj.addEventListener("webkitTransitionEnd", event,false);
      obj.addEventListener("oTransitionEnd", event,false);
      obj.addEventListener("transitionend", event,false);
      return true;
    } catch(e) {
      return false;
    }
  }
  
  var Player = function(info) {
    this.nick = info.getValue("key");
    this.message = info.getValue("msg");
    
    this.isBall = this.nick.indexOf("Ball-") == 0;

    this.appended = false;
    
    this.div = null;
    this.sub = null;
    this.avatar = null;
    this.posY = null;
    this.posX = null;
    
    this.messageEl = null;
    this.showBigWords = true;

    this.divMsg = null;
      
    this.randomNum = getRandomNum();
    this.color = COLORS[this.randomNum-1];
  };
  
  Player. prototype = {
    getColor: function() {
      return this.color;
    },
     
    makeAvatar: function(room,msnry,noMorph) {
      if (this.avatar) {
        return;
      } else if (this.div && !noMorph) {
        return;
      }
      
      this.avatar = document.createElement('div');
      
      
      if (this.isBall) {
        this.avatar.className = "divBall";
        this.avatar.style.width=BALL_WIDTH+'px';
        this.avatar.style.height=BALL_HEIGHT+'px';
        
        var div = document.createElement("div");
        var img = document.createElement("img");
        img.src = "images/ball.png";
        img.style.border='0';
        img.style.width=BALL_WIDTH+'px';
        img.style.height=BALL_HEIGHT+'px';
        div.appendChild(img);
        this.avatar.appendChild(div);
        
      } else {
        this.avatar.className = "divPerson";
        this.avatar.style.width=IMG_WIDTH+'px';
        this.avatar.style.height=IMG_HEIGHT+'px';
        
        this.messageEl = document.createTextNode("-");
        this.divMsg = document.createElement("div");
        this.divMsg.className="triangle-border triangle-border"+this.randomNum;
        this.divMsg.style.fontSize = COLD_FONT_SIZE;
        this.divMsg.style.borderColor = this.getColor();
        this.divMsg.appendChild(this.messageEl);
        this.avatar.appendChild(this.divMsg);
        var that = this;
        this.showBigWords =  addTransitionEnd(this.divMsg,function() {
          if (that.avatar && that.divMsg.style.fontSize == HOT_FONT_SIZE) {
            that.divMsg.style.fontSize = COLD_FONT_SIZE;
          }
        });
        
        var div = document.createElement("div");
        div.className = "highvSmall";
        div.appendChild(document.createTextNode(this.nick));
        this.avatar.appendChild(div);
        
        var divImg = document.createElement("div"); 
        var img = document.createElement("img");
        img.src = "images/person-"+ (this.randomNum <= 9 ? "0"+this.randomNum : this.randomNum) +".png";
        img.style.border='0';
        img.style.width=IMG_WIDTH+'px';
        img.style.height=IMG_HEIGHT+'px';
        divImg.appendChild(img);
        this.avatar.appendChild(divImg);
        
        this.talk(this.message,true);

      }
      
      this.room = room;
      this.goTo(this.posX,this.posY);
      
    },
    goTo: function(x,y) {
    
      this.posX = x === null ? this.posX : x;
      this.posY = y === null ? this.posY : y;
      
      if (this.posX === null && this.posY === null) {
        return;
      }
      
      var el = this.avatar;
      if (!el) {
        return;
      }
      
      var offsetHeight = el.offsetHeight !== 0 ? el.offsetHeight : (this.isBall ? BALL_HEIGHT : IMG_HEIGHT);
      var offsetWidth =  el.offsetWidth !== 0 ? el.offsetWidth : (this.isBall ? BALL_WIDTH : IMG_WIDTH);
      
      if (this.isBall) {
        el.style.left = (this.posX-(offsetWidth/2))+"px";
        el.style.top = (this.posY-(offsetHeight/2))+"px";
      } else {
        //the reference point is not its center
        el.style.left = (this.posX-offsetWidth)+"px";
        el.style.top = (this.posY-offsetHeight)+"px";
      }
      
      if (!this.appended && this.room) {
        this.room.appendChild(el);
        this.appended = true;
      }
    
    },
    removeAvatar: function() {
      if (!this.avatar) {
        return;
      } 
      
      if (this.avatar.parentNode) {
        this.avatar.parentNode.removeChild(this.avatar);
      }
      this.avatar = null;
      this.room = null;
    },
    subscribe: function(unfiltered) {
      if (this.sub) {
        return;
      }
      this.sub = new Subscription("MERGE", this.nick, ["posX", "posY"]); 
      this.sub.setRequestedSnapshot("yes");
      if (unfiltered) {
        this.sub.setRequestedMaxFrequency("unfiltered");
      }
      
      this.sub.addListener(this);
      
      lsClient.subscribe(this.sub);
    },
    unsubscribe: function() {
      if (!this.sub) {
        return;
      }
      lsClient.unsubscribe(this.sub);
      this.sub = null;
    },
    
    talk: function(newMsg,isFirst) {
      var newMsg = newMsg || '';
      if (newMsg!=this.message || isFirst) {
        
        if (this.messageEl) {
          this.messageEl.nodeValue = newMsg;
        }
        
        if (newMsg == '') {
          this.divMsg.style.display = "none";
        } else {
          this.divMsg.style.fontSize = COLD_FONT_SIZE;
          this.divMsg.style.display = "";
          if ( newMsg.length  < 5 ) {
            this.divMsg.style.minWidth = "35px";
          } else {
            this.divMsg.style.minWidth = "65px";
          }
        }
        
        if (!isFirst && this.showBigWords) {

          if (this.message == "") {
            //without this hack the transition will not execute (at least on chrome)
            var that = this;
            setTimeout(function() {
              that.divMsg.style.fontSize = HOT_FONT_SIZE;
            },1);
          } else {
            this.divMsg.style.fontSize = HOT_FONT_SIZE;
          }
        }
        this.message = newMsg;
      }
    },
    
    updatePlayer: function(info,positionData) {

      if (!this.isBall) {
        var newMsg = info.getValue("msg");
        this.talk(newMsg, false);
      }
      
      if (positionData) {
        this.goTo(info.getValue("posX"),info.getValue("posY"));
      }
      
    }
  };
  
  return Player;
  
});
