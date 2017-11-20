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
        util.playTheme(g_audio.theme);
        g_countdown.timeLeft = g_countdown.duration;
        this.loadPlayers();
        this.setupReady = true;
        entityManager._generateClouds();
        entityManager._generateArrow();
        if(entityManager._ships.length > 0) {
          entityManager._ships[0].myTurn = true;
          entityManager._generateArrow();
        }
    },
    reset : function() {
      this.inputLock = false,

      this.doorTranslate = 0,
      this.isDoorLocked = true,
      this.discardDoor = false,

      this.setupReady = false,
      this.setupIndex = 0,
      this.alivePlayers = 0,

      this.hasWinner = false,

      this.players = [],


      this._ = {
          turn : 0
      }
      this.activePlayerIndex = 0,

      this.init();
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
                 weapon : consts.weapons[0],
                 flagsprite: this.players[i].flagsprite
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
        g_countdown.stop = false;
        g_countdown.timeLeft = g_countdown.duration;

        entityManager._ships[this.activePlayerIndex].myTurn = false;

        if(this.checkForWinner()){
          console.log("we have a winner, player nr: " + (this.activePlayerIndex+1) );
          entityManager._ships[this.activePlayerIndex].myTurn = true;
          return;

        }
        this.turnCircle++;
          this._.turn++;
          this.resetIsHit();
          this.updateNextPlayer();

        /*  while(this.checkIfAlive(this.activePlayerIndex)){
            this.updateNextPlayer();
          };*/
          this.findNextPlayer();

          entityManager._ships[this.activePlayerIndex].myTurn = true;
          //get more ammo
          if(entityManager._ships[this.activePlayerIndex].ammo < 1){
            entityManager._ships[this.activePlayerIndex].ammo++;
        }
          /*
            get new wind direction and power,
            only when all alive players have had the chance to
            play with the current wind.
          */
          if(this._.turn % this.alivePlayers === 0) {

            g_wind = util.randomWind();

          }

      },

      resetIsHit: function (){
        for(var i = 0; i< entityManager._ships.length; i++){
          entityManager._ships[i].isHit = false;
        }
      },

      checkForWinner: function(){
          var cnt = 0;
          var target = this.players.length -1;
          this.alivePlayers = 0;
        for(var i = 0; i< this.players.length; i++){
          if(entityManager._ships[i]._isDeadNow){
            cnt++;

          }
          else {
            this.alivePlayers++;
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
