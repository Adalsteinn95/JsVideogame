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
        entityManager._ships[0].myTurn = true;
        //entityManager._generateClouds();
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
                 playerId : this.players[i].id
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
        var died = 0;
        var winner = this.activePlayerIndex+1;
        //this._.turn++;
        //this.resetIsHit();

        //if(this.checkIfAlive()){
        while(entityManager._ships[this.clamp(this.activePlayerIndex+1)]._isDeadNow){
          ++this.activePlayerIndex;
          this.activePlayerIndex = this.clamp(this.activePlayerIndex);
          ++died;
          //shitty winner check notað fyrir debugging
          if(died >= this.players.length -1){
            console.log("player number " + winner + " won the game" );
            this.hasWinner = true;
            entityManager._ships[this.clamp(winner-1)].myTurn = true;
            //this.activePlayerIndex = this.clamp(this.activePlayerIndex);

          }
        }
        if(this.hasWinner){

          return;
        }
        this._.turn++;
        this.resetIsHit();


        entityManager._ships[this.clamp(this.activePlayerIndex+1)].myTurn = true;
        this.activePlayerIndex++;
        this.activePlayerIndex %= this.players.length;
        g_wind = util.randRange(-0.1,0.1);

      },

      resetIsHit: function (){
        for(var i = 0; i< entityManager._ships.length; i++){
          entityManager._ships[i].isHit = false;
        }
      },

      /*checkIfAlive: function (){
        var cnt = this.players.length;
        var i = this.activePlayerIndex;
        console.log("hér " + entityManager._ships);
        while(entityManager._ships[i]){
          i++;
          cnt--;
          if(cnt === 0){
            //allir nema einn dauður
            return false;
          }
        }

        this.activePlayerIndex = i;
        return true;

      },*/

      updateWeapon: function(){



      }



}
