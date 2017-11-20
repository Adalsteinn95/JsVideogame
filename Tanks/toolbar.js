"use strict";

var toolbar = {

    setupReady : false,
    setupIndex : 0,
    idSelected: false,
    font: "Courier new",

    KEY_PLUS : '39',
    KEY_MINUS : '37',
    KEY_CONFIRM : '13', //'enter'-keycode
    KEY_BACK : '8', //'backspace'-keycode
    KEY_REROLL : 'R'.charCodeAt(0),

    //various private variables
    //mætti lesa þetta inn úr JSON
    _ : {
        numPlayers : 2,
        maxPlayers : 4,
        minPlayers : 2,
        playerIndex : 0,
        humanOrAI : true,

        setupBox: {
            cx: 50,
            cy: 180,
            w: 300,
            h: 50,
            minX: 50,
            maxX: 370
        },

        mapBox : {
            cx : 360,
            cy : 40,
            w : g_canvas.width/5,
            h : g_canvas.height/5
        },

        flagSetup: {
            cx: 370,
            cy: 50,
            w: 160,
            h: 100,
            index: 0
        },

        windBox : {
            cx : 250,
            cy : 105,
            w : 100,
            h : 40
        },

        powBox : {
            cx : 250,
            cy : 35,
            w : 150,
            h : 30
        },
        lifeBox : {
          cx : 600,
          cy : 0,
          w : 150,
          h : 80,
          h2: 20
        },

        rotBox : {
            r : 50,
            cx : 495,
            cy : 95
        }

    },

    playerIdSetup : [],
    playerFlagSetup: [],

    init : function() {
        this.rerollMap();
        this.drawBackground(dash_ctx);
    },
    reset : function() {
      this.setupReady = false;
      this.setupIndex = 0;
      this.idSelected = false;
      this.playerIdSetup  =  [];
      this.playerFlagSetup =  [];
      this._numPlayers = 2
      this._.numPlayers = 2;
      this._.maxPlayers = 4;
      this._.minPlayers = 2;
      this._.playerIndex = 0;
      this._.humanOrAI = true;

      this.init();

    },

    drawBackground : function(ctx) {
        ctx.fillStyle = "#666";
        ctx.fillRect(0,0, g_dash.width, g_dash.height);
    },

    render : function(ctx) {
        this.drawBackground(ctx);
        this.setupReady ? this.renderToolbar(ctx) : this.renderSetup(ctx);
    },

    ////////////////////
    ///  SETUP STUFF ///
    ////////////////////

    renderSetup : function(ctx) {
        switch (this.setupIndex) {
            case 0:
                this.renderNumPlayer(ctx);
                break;
            case 1:
                this.renderPlayerSetup(ctx);
                this.renderFlagSetup(ctx);
                break;
            case 2:
                this.renderMapPreview(ctx);
                break;
            default:
        }
    },

    renderNumPlayer : function(ctx) {
        util.drawTextAt(ctx, 50, 75, this.font, "20px", "black",
                        "Number of players");
        util.drawTextAt(ctx, 50, 100, this.font, "20px", "black",
                        this._.numPlayers);

        if (eatKey(this.KEY_PLUS) && this._.numPlayers < this._.maxPlayers) {
            this._.numPlayers++;
        }
        if (eatKey(this.KEY_MINUS) && this._.numPlayers > this._.minPlayers) {
            this._.numPlayers--;
        }
        if (eatKey(this.KEY_CONFIRM)) {
            this.setupIndex++;
        }
    },

    renderPlayerSetup : function(ctx) {

        var box = this._.setupBox;
        var text = this.idSelected ? "Select team!" : "Select ID!";

        if (this.idSelected) {
            if (box.cx < box.maxX) box.cx += 10;
        } else {
            if (box.cx > box.minX) box.cx -= 10;
        }

        util.drawTextAt(ctx, box.cx, box.cy, this.font, "20px", "black", text);

        var id = this._.humanOrAI ? "Human" : "AI";
        util.drawTextAt(ctx, 50, 75, this.font, "20px", "black",
                        "Player " + (this._.playerIndex + 1) + " is:");
        util.drawTextAt(ctx, 50, 100, this.font, "20px", "black",
                        id);

        if (eatKey(this.KEY_PLUS)) {
            if (this.idSelected) {
                this._.flagSetup.index++;
                this._.flagSetup.index %= 16;
            } else {
                this._.humanOrAI = !this._.humanOrAI;
            }
        }
        if (eatKey(this.KEY_MINUS)) {
            if (this.idSelected) {
                this._.flagSetup.index--;
                if (this._.flagSetup.index < 0) this._.flagSetup.index = 15;
            } else {
                this._.humanOrAI = !this._.humanOrAI;
            }
        }

        var flagI = this._.flagSetup.index;

        if (eatKey(this.KEY_CONFIRM)) {
            if (this.idSelected) {
                this.idSelected = false;
                this.playerFlagSetup[this._.playerIndex] = flagI;
                if (this.playerIdSetup.length === this._.numPlayers) {
                    this.pushPlayers(this.playerIdSetup, this.playerFlagSetup);
                    this.setupIndex++;
                }
                this._.playerIndex++;
            } else {
                if (this.playerIdSetup.length < this._.numPlayers) {
                    this.playerIdSetup[this._.playerIndex] = id;
                }
                this.idSelected = true;
            }
        }
    },

    renderFlagSetup: function(ctx) {
        var box = this._.flagSetup;
        var img = g_sprites.flags[box.index];
        ctx.drawImage(img.image, box.cx, box.
          cy, box.w, box.h);
    },

    pushPlayers: function(playerIds, flagIds) {
        for (var i in playerIds) {
            var flagI = flagIds[i];
            var sprite = g_sprites.flags[flagI];
            gameplayManager.addPlayer({
                nr : parseInt(i),
                id : playerIds[i],
                flagsprite: sprite
            });
        }
    },

    renderMapPreview : function(ctx) {
        var box = this._.mapBox;

        util.drawTextAt(ctx, 50, 75, this.font, "20px", "black", "Map preview:");
        util.drawTextAt(ctx, 50, 150, this.font, "20px", "black", "\'R\' to reroll!");

        util.fillBox(ctx, box.cx, box.cy, box.w, box.h, "#ADD8E6");

        ctx.save();
        ctx.translate(box.cx, box.cy);
        ctx.scale(0.2, 0.2);
        entityManager._terrain[0].render(ctx, g_canvas);
        ctx.restore();

        util.strokeBox(ctx, box.cx, box.cy, box.w, box.h, "black");

        if (eatKey(this.KEY_REROLL)) {
            this.rerollMap();
        }

        if (eatKey(this.KEY_CONFIRM)) {
            this.setupReady = true;
            util.playTheme(g_audio.theme);
            gameplayManager.init();
            gameplayManager.isDoorLocked = false;
        }
    },

    rerollMap : function() {
        //Hann finnur map í svona 1.5 ítrunum að meðaltali
        var terrain = entityManager._terrain[0]
        while (true) {
            var f = util.randInt(0, terrain.fun.length);
            var shift = (Math.floor(Math.random() * 2)) === 1 ? 1 : -1;
            terrain.g_landscape = terrain.initlandScape(terrain.fun[f], shift, g_canvas)
            if (!terrain.g_landscape) {
                continue;
            } else {
                break;
            }
        }
    },

    //////////////////////////
    ///  SETUP READY STUFF ///
    //////////////////////////

    renderToolbar : function(ctx) {

        var tank = entityManager._ships[gameplayManager.activePlayerIndex];

        util.drawTextAt(ctx, 30, 30, this.font, "25px", "black",
        "Turn " + (gameplayManager._.turn + 1));

        util.drawTextAt(ctx, 30, 55, this.font, "25px", "black",
        "Player " + parseInt(tank.playerNr+1))
        this.renderWeapon(ctx, tank);
        this.renderWind(ctx);
        this.renderPower(ctx, tank);
        this.renderLifebars(ctx);
        this.renderRotation(ctx, tank);
        this.renderTime(g_ctx);
        this.renderSound(g_ctx);
    },

    renderWeapon : function(ctx, tank) {
        util.drawTextAt(ctx, 30, 95, this.font, "20px", "black", "Ammo: " +
                        tank.ammo);
        util.drawTextAt(ctx, 30, 120, this.font, "20px", "black", "Weapon: " +
                        tank.weapon.name);
        util.drawTextAt(ctx, 30, 145, this.font, "20px", "black", "Cost: " +
                        tank.weapon.cost);
    },

    renderLifebars : function(ctx) {
      //þarf að breyta originalHealth af að healthi er breytt
      var originalHealth = 200;
      var red, green;
      var box = this._.lifeBox;
      var offsetX = 0;
      var offsetY = 0;
      var gradient = ctx.createLinearGradient(box.cx,box.cy,box.cx+box.w,box.h);
      gradient.addColorStop(0,"#FF3030");
      gradient.addColorStop(0.5, "#FFD700");
      gradient.addColorStop(1, "#7CFC00");
      for(var i = 0; i < entityManager._ships.length; i++ ){
        if(i === 2) {
          offsetY = box.h + box.h2;
          offsetX = 0;
        }
        else if (i < 2){
          offsetY = 0;
        }

        var sprite = entityManager._ships[i].flagsprite;
        sprite.drawFixedAt(ctx, box.cx + offsetX, box.cy + offsetY, box.w, box.h);

        if (gameplayManager.activePlayerIndex === i) {
            ctx.lineWidth = 5;

        }
        util.strokeBox(ctx, box.cx + offsetX, box.cy + offsetY, box.w, box.h, "black")

        util.fillBox(ctx, box.cx + offsetX, box.cy + offsetY + box.h, box.w, box.h2, "#B0E0E6");
        var health = entityManager._ships[i].health

        if (health < originalHealth / 2 ) {
           red = 255;
           green = (health/50) * 255;
        }
        else {
          green = 255;
          red = ((originalHealth - health) / 50) * 255
        }

        var color = 'rgb(' + Math.round(red) +  ',' + Math.round(green) + ',' + 0 + ')';

        var x = (entityManager._ships[i].health / originalHealth) * box.w;
        util.fillBox(ctx, box.cx + offsetX, box.cy + offsetY + box.h, x, box.h2, color);
        util.strokeBox(ctx, box.cx + offsetX, box.cy + offsetY + box.h, box.w, box.h2, "black")

        offsetX += box.w;
        ctx.lineWidth = 2;
      }
    },

    renderTime : function(ctx) {
        ctx.textAlign = 'center';
        var oneThird = (g_countdown.timeLeft < (g_countdown.duration / 3) ) 
        var color = oneThird ? "red" : "black";
        var fixedNum = oneThird ? 2 : 0;
        util.drawTextAt(ctx, g_canvas.width/2, 30, "Comic Sans MS", "20px", color, (g_countdown.timeLeft / 60).toFixed(fixedNum));
    },

    renderWind : function(ctx) {
        var box = this._.windBox;
        var wind = g_wind;
        var dir = (g_wind < 0) ? -1 : 1;
        wind = Math.abs(g_wind * 1000);

        util.drawTextAt(ctx, box.cx, box.cy - 5, this.font, "20px", "black",
        "Wind " + wind.toFixed(2));

        util.fillBox(ctx, box.cx, box.cy, box.w, box.h, "#FFF");
        ctx.save();
        ctx.strokeStyle = "#222";
        ctx.beginPath();
        ctx.moveTo(box.cx + box.w/2, box.cy);
        var point = wind/200 * (box.w/2) * dir;
        ctx.lineTo(box.cx + box.w/2 + point, box.cy + box.h/2);
        ctx.lineTo(box.cx + box.w/2, box.cy + box.h);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        util.strokeBox(ctx, box.cx, box.cy, box.w, box.h, "#000");
    },

    renderPower : function(ctx, tank) {

        var box = this._.powBox;
        util.drawTextAt(ctx, box.cx, box.cy-5, this.font, "25px", "black", "POWER");
        util.fillBox(ctx, box.cx, box.cy, box.w, box.h, "#B0E0E6");

        var gradient = ctx.createLinearGradient(box.cx,box.cy,box.cx+box.w,box.h);
        gradient.addColorStop(0,"#7CFC00");
        gradient.addColorStop(0.5, "#FFD700");
        gradient.addColorStop(1, "#FF3030");
        var tankPower = tank.power
        tankPower = (tankPower > 6 || tankPower < 0.3) ? Math.floor(tankPower) : tankPower;
        var x = (tankPower / 6) * box.w;
        util.fillBox(ctx, box.cx, box.cy, x, box.h, gradient);
        ctx.lineWidth = 2;
        util.strokeBox(ctx, box.cx, box.cy, box.w, box.h, "black")
    },

    renderRotation : function(ctx, tank) {
        ctx.save();
        var box = this._.rotBox;
        util.drawTextAt(ctx, box.cx - 55, box.cy - 65, this.font, "25px", "black", "Rotation");

        ctx.fillStyle = "#FFF";
        util.fillCircle(ctx, box.cx, box.cy, box.r, Math.PI*2, 0);

        var rotText = (Math.abs(util.toDegrees(tank.gunrotation) + tank.rotation - 180).toFixed(2) + "°");
        ctx.textAlign = "center";
        util.drawTextAt(ctx, box.cx, box.cy-20, this.font, "14px", "black", rotText);

        ctx.save();
        ctx.strokeStyle = "#F00";
        ctx.lineWidth = 3;
        ctx.translate(box.cx, box.cy);
        ctx.rotate(tank.gunrotation - Math.PI/2 + (tank.rotation * (Math.PI/180)));
        ctx.translate(-box.cx, -box.cy);
        ctx.beginPath();
        ctx.moveTo(box.cx,box.cy);
        ctx.lineTo(box.cx, box.cy - box.r);
        ctx.stroke();
        ctx.closePath();
        ctx.rotate(-tank.gunrotation);
        ctx.restore();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        util.strokeCircle(ctx, box.cx, box.cy, box.r, Math.PI*2, 0);
        ctx.fillStyle = "#000";
        util.fillCircle(ctx, box.cx, box.cy, box.r/5, Math.PI*2,0);

        /*
        ctx.beginPath();
        ctx.moveTo(box.cx - box.r, box.cy+1);
        ctx.lineTo(box.cx + box.r, box.cy+1);
        ctx.stroke();
        ctx.closePath();
        */
        ctx.restore();
    },
    renderSound : function(ctx) {
        g_sprites.music.drawFixedAt(ctx, g_canvas.width - 60, 5,20,20);
        g_sprites.sound.drawFixedAt(ctx, g_canvas.width - 30, 5,20,20);

        //music off, sound off
        if(!g_musicOn && g_mute) {
          g_sprites.off.drawFixedAt(ctx, g_canvas.width - 60-3, 5-3.5,30,30);
          g_sprites.off.drawFixedAt(ctx, g_canvas.width - 30-3, 5-3.5,30,30);

        }
        //music off, sound on
        else if(!g_musicOn && !g_mute) {
          g_sprites.off.drawFixedAt(ctx, g_canvas.width - 60-3, 5-3.5,30,30);


        }
        //music on, sound off
        else if(g_musicOn && g_mute){
          g_sprites.off.drawFixedAt(ctx, g_canvas.width - 30-3, 5-3.5,30,30);

        }

    }


}
