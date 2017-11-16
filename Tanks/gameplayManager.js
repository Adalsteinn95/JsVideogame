"use strict";

var gameplayManager = {

    inputLock : false,

    doorTranslate : 0,
    isDoorLocked : true,
    discardDoor : false,

    setupReady : false,
    setupIndex : 0,

    alivePlayers : 0,

    hasWinner : false,

    players : [],

    _ : {
        turn : 0
    },

    activePlayerIndex : 0,

    keyLock : function() {
        return this.lock;
    },

    init : function() {
        this.loadPlayers();
        this.setupReady = true;
        entityManager._generateClouds();
        entityManager._generateArrow();
        entityManager._ships[0].myTurn = true;
    },

    setup : function() {

    },

    render : function(ctx) {
        if (!this.discardDoor) {
            this.gameDoor(ctx);
        }
    },

    addPlayer : function(descr) {
        this.players.push(new Player(descr));
    },

    gameDoor : function(ctx) {

        if (!this.isDoorLocked) { this.doorTranslate += 5; }

        ctx.save();
        ctx.translate(this.doorTranslate, 0);

        ctx.drawImage(g_images.rightDoor, g_canvas.width/2, 0,
                      g_canvas.width/2, g_canvas.height);

        ctx.restore();
        ctx.save();
        ctx.translate(-this.doorTranslate, 0);

        ctx.drawImage(g_images.leftDoor, 0, 0,
                      g_canvas.width/2, g_canvas.height);

        ctx.restore();

        if (this.doorTranslate > g_canvas.width/2) {
            this.discardDoor = true;
        }
    },

    loadPlayers : function() {
        for (var i in this.players) {
             entityManager.generateShip({
                 cx : util.randRange(0, g_canvas.width),
                 cy: 200,
                 playerNr : this.players[i].nr,
                 playerId : this.players[i].id,
                 weapon : consts.weapons[0]
             });
        }
    },

    clamp: function(i){
      if(i >= this.players.length){
        i -= this.players.length;
      }
      return i;
    },

      nextTurn: function (){

        if(this.checkForWinner()){
          console.log("we have a winner, player nr: " + (this.activePlayerIndex+1) );
          entityManager._ships[this.activePlayerIndex].myTurn = true;
          return;

        }
          this._.turn++;
          this.resetIsHit();
          this.updateNextPlayer();

        /*  while(this.checkIfAlive(this.activePlayerIndex)){
            this.updateNextPlayer();
          };*/
          this.findNextPlayer();

          entityManager._ships[this.activePlayerIndex].myTurn = true;
          entityManager._ships[this.activePlayerIndex].preMoveCalc = false;
          //get more ammo
          if(entityManager._ships[this.activePlayerIndex].ammo < 1){
            entityManager._ships[this.activePlayerIndex].ammo++;
        }
          //get new wind direction and power
          g_wind = util.randRange(-0.1,0.1);

      },

      resetIsHit: function (){
        for(var i = 0; i< entityManager._ships.length; i++){
          entityManager._ships[i].isHit = false;
        }
      },

      checkForWinner: function(){
          var cnt = 0;
          var target = this.players.length -1;
        for(var i = 0; i< this.players.length; i++){
          if(entityManager._ships[i]._isDeadNow){
            cnt++;
          }
        }
        if (cnt >= target){
          return true
        }

        return false;

      },

      updateNextPlayer: function(){
        this.activePlayerIndex++;
        this.activePlayerIndex %= this.players.length;
      },

      checkIfAlive: function(num){
        if(entityManager._ships[num]._isDeadNow){
          return true;
        }else return false;

      },

      findNextPlayer: function(){
        while(this.checkIfAlive(this.activePlayerIndex)){
          this.updateNextPlayer();
        }
      }

}
