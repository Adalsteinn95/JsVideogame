"use strict";

var gameplayManager = {

    inputLock : false,

    doorTranslate : 0,
    isDoorLocked : true,
    discardDoor : false,

    setupReady : false,
    setupIndex : 0,

    alivePlayers : 0,

    gameOver : false,
    winnerId: null,


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
        console.log('G_COUNTDOWN.TIMELEFT', g_countdown.timeLeft)
        this.loadPlayers();
        this.setupReady = true;
        entityManager._generateClouds();
        entityManager._generateArrow();
        entityManager._ships[0].myTurn = true;
        this.alivePlayers = this.players.length;
    },

    setup : function() {

    },

    render : function(ctx) {
        if (!this.discardDoor) {
            this.gameDoor(ctx);
        }
        if (this.gameOver) {
            g_countdown.stop = true;
            util.renderGameOver(g_ctx, this.winnerId);
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

      nextTurn: function () {
          g_countdown.stop = false;
          g_countdown.timeLeft = g_countdown.duration;

          entityManager._ships[this.activePlayerIndex].myTurn = false;

          if (this.countAlive() === 1) {
              var winner = this.findWinner();
              this.winnerId = (winner.playerNr+1);
              this.gameOver = true;
              entityManager._ships[this.activePlayerIndex].myTurn = true;
          } else if (this.countAlive() < 1) {
                  this.winnerId = "nobody";
                  this.gameOver = true;
          }

          this.turnCircle++;
          this._.turn++;
          this.resetIsHit();
          this.updateNextPlayer();
          if (this.countAlive() > 0) this.findNextPlayer();

          entityManager._ships[this.activePlayerIndex].myTurn = true;
          entityManager._ships[this.activePlayerIndex].preMoveCalc = false;
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

      findWinner: function() {
          var players = entityManager._ships;
          for (var i in players) {
              if (!players[i]._isDeadNow) {
                  return players[i];
              }
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
    },

    countAlive: function() {
        var count = 0;
        var players = entityManager._ships
        for (var i in players) {
            if (!players[i]._isDeadNow) count++;
        }
        return count;
    }

}
