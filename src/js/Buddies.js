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

define(["./Player","./lsClient"],function(Player,lsClient) {
  
  var SIMPLE = 1;
  var POS = 2;
  var EMPTY = 3;
    
  var Buddies = function(unfilteredPlayers,meDiv,room,singleSub) {
    this.unfilteredPlayers = unfilteredPlayers;
    if(this.unfilteredPlayers) {
      alert("WARNING: unfiltered players!");
    }
    this.status = null;
    
    this.meDiv = meDiv;
    this.me = null;
    
    this.container = null;
    this.msnry = null;
    this.room = room;
    
    this.singleSub = singleSub;
    
    this.players = {};
  };
  
  Buddies.prototype = {
    
    setOwnerNick: function(nick) {
      this.me = nick;
      if (nick!=null && this.players[nick]) {
        this.setOwnerColor();
      }
    },
    
    setOwnerColor: function() {
      this.meDiv.style.backgroundColor = this.players[this.me].getColor();
    },
    
    positionBuddies: function() {
      if (this.status == POS) {
        return;
      }
      this.status = POS;
      
      this.makeAvatars();
      
    },
    
    noBuddies: function() {
      if (this.status == EMPTY) {
        return;
      }
      this.status = EMPTY;
      this.clearAvatars();
    },
    
    clearAvatars: function() {
      for (var i in this.players) {
        this.players[i].removeAvatar(this.msnry);
      }
      
      this.players = {};
    },
    
    makeAvatars: function() {
      for (var i in this.players) {
        this.players[i].makeAvatar(this.room,this.msnry);
      }
    },
    
    subscribeAll: function() {
      if (this.singleSub) {
        return;
      }
      for (var i in this.players) {
        this.players[i].subscribe(this.unfilteredPlayers);
      }
    },
    
    onUnsubscription: function() {     
      //do clear 
      this.clearTiles();
      this.clearAvatars();
      this.unsubscribeAll();
      
      this.players = {};
    },
      
    //subscription listener  
    onItemUpdate: function(info){
      
      if (info.getValue("command") == "ADD") {
        var newPlayer = new Player(info);
        var playerNick = info.getValue("key");
        this.players[playerNick] = newPlayer;
       
        if (playerNick == this.me) {
          this.setOwnerColor();
        }
        
        if (!this.singleSub) {
          newPlayer.subscribe(this.unfilteredPlayers);
        }

        newPlayer.makeAvatar(this.room,this.msnry);
        
      } else if (info.getValue("command") == "DELETE") {
        var removingPlayer = this.players[info.getValue("key")];
        
        if (!this.singleSub) {
          removingPlayer.unsubscribe();
        }
        
        delete(this.players[info.getValue("key")]);

        removingPlayer.removeAvatar(this.msnry);

        return;
      } 
      
      this.players[info.getValue("key")].updatePlayer(info,true);
    }
  };
    
  return Buddies;
  
});