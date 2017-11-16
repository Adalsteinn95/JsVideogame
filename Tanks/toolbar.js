"use strict";

var toolbar = {

    setupReady : false,
    setupIndex : 0,

    KEY_PLUS : '8'.charCodeAt(0),
    KEY_MINUS : '7'.charCodeAt(0),
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

        mapBox : {
            cx : 360,
            cy : 40,
            w : g_canvas.width/5,
            h : g_canvas.height/5
        },

        windBox : {
            tx : 50,
            ty : 100,
            cx : 50,
            cy : 105,
            w : 50,
            h : 50
        },

        powBox : {
            cx : 300,
            cy : 80,
            w : 150,
            h : 30
        },

        rotBox : {
            tx : 500,
            ty : 75,
            r : 50,
            cx : 555,
            cy : 140
        }

    },

    playerIdSetup : [],

    init : function() {
        //global landscape initiated here
        g_landscape = terrain.initlandScape(util.fun[2], bound, xShift, g_canvas);
        this.drawBackground(dash_ctx);
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
                break;
            case 2:
                this.renderMapPreview(ctx);
                break;
            default:
        }
    },

    renderNumPlayer : function(ctx) {
        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black",
                        "Number of players");
        util.drawTextAt(ctx, 50, 100, "Courier", "20px", "black",
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

        var id = this._.humanOrAI ? "Human" : "AI";

        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black",
                        "Player " + (this._.playerIndex + 1) + " is:");
        util.drawTextAt(ctx, 50, 100, "Courier", "20px", "black",
                        id);

        if (eatKey(this.KEY_PLUS) || eatKey(this.KEY_MINUS)) {
            this._.humanOrAI = !this._.humanOrAI;
        }

        if (eatKey(this.KEY_CONFIRM)) {
            if (this.playerIdSetup.length < this._.numPlayers) {

                this.playerIdSetup[this._.playerIndex] = id;
                this._.playerIndex++;
            }
            if (this.playerIdSetup.length === this._.numPlayers) {
                this.pushPlayers(this.playerIdSetup);
                this.setupIndex++;
            }
        }
    },

    pushPlayers(playerIds) {
        for (var i in playerIds) {
            gameplayManager.addPlayer({
                nr : parseInt(i),
                id : playerIds[i]
            });
        }
    },

    renderMapPreview : function(ctx) {
        var box = this._.mapBox;

        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black", "Map preview:");

        util.fillBox(ctx, box.cx, box.cy, box.w, box.h, "#ADD8E6");

        ctx.save();
        ctx.translate(box.cx, box.cy);
        ctx.scale(0.2, 0.2);
        terrain.render(ctx, g_landscape, g_canvas);
        ctx.restore();

        util.strokeBox(ctx, box.cx, box.cy, box.w, box.h, "black");

        if (eatKey(this.KEY_REROLL)) {
            this.rerollMap();
        }

        if (eatKey(this.KEY_CONFIRM)) {
            this.setupReady = true;
            gameplayManager.init();
            gameplayManager.isDoorLocked = false;
        }
    },

    rerollMap : function() {
        var i =  util.randInt(0, util.fun.length);
        g_landscape = terrain.initlandScape(util.fun[i], bound, xShift, g_canvas);
    },

    //////////////////////////
    ///  SETUP READY STUFF ///
    //////////////////////////

    renderToolbar : function(ctx) {

        var tank = entityManager._ships[gameplayManager.activePlayerIndex];

        util.drawTextAt(ctx, 50, 30, "Courier", "25px", "black",
        "Turn " + gameplayManager._.turn +
        ": player " + parseInt(tank.playerNr+1));
        this.renderWeapon(ctx);
        this.renderWind(ctx);
        this.renderPower(ctx, tank);
        this.renderRotation(ctx, tank);
        this.renderTime(g_ctx);
    },

    renderWeapon : function(ctx) {

        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black", "Weapon: " + entityManager._ships[gameplayManager.activePlayerIndex].weapon.name);

    },
    renderTime : function(ctx) {
        ctx.textAlign = 'center';
        var oneThird = (g_countdown.timeLeft < (g_countdown.duration / 3) ) 
        var color = oneThird ? "red" : "black";
        var fixedNum = oneThird ? 2 : 0;
        util.drawTextAt(ctx, g_canvas.width/2, 30, "Comic Sans MS", "20px", color, (g_countdown.timeLeft / 60).toFixed(fixedNum))


    },

    renderWind : function(ctx) {
        var box = this._.windBox;
        var wind = g_wind;
        var dir = (g_wind < 0) ? -1 : 1;
        wind = Math.abs(g_wind * 1000);

        util.drawTextAt(ctx, box.tx, box.ty, "Courier", "20px", "black",
        "Wind " + wind.toFixed(2));

        util.fillBox(ctx, box.cx, box.cy, box.w, box.h, "#FFF");
        ctx.save();
        ctx.strokeStyle = "#222";
        ctx.beginPath();
        ctx.moveTo(box.cx + box.w/2, box.cy);
        var point = wind/100 * (box.w/2) * dir;
        ctx.lineTo(box.cx + box.w/2 + point, box.cy + box.h/2);
        ctx.lineTo(box.cx + box.w/2, box.cy + box.h);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        util.strokeBox(ctx, box.cx, box.cy, box.w, box.h, "#000");
    },

    renderPower : function(ctx, tank) {

        var box = this._.powBox;
        util.drawTextAt(ctx, box.cx, box.cy-5, "Courier", "25px", "black", "POWER");
        util.fillBox(ctx, box.cx, box.cy, box.w, box.h, "#B0E0E6");

        var gradient = ctx.createLinearGradient(box.cx,box.cy,box.cx+box.w,box.h);
        gradient.addColorStop(0,"#7CFC00");
        gradient.addColorStop(0.5, "#FFD700");
        gradient.addColorStop(1, "#FF3030");
        var tankPower = tank.power
        tankPower = (tankPower > 6 || tankPower < 0.3) ? Math.floor(tankPower) : tankPower;
        var x = (tankPower / 6) * box.w;
        console.log('TANK.POWER', tank.power)
        util.fillBox(ctx, box.cx, box.cy, x, box.h, gradient);
        ctx.lineWidth = 2;
        util.strokeBox(ctx, box.cx, box.cy, box.w, box.h, "black")
    },

    renderRotation : function(ctx, tank) {
        ctx.save();
        var box = this._.rotBox;
        util.drawTextAt(ctx, box.tx, box.ty, "Courier", "25px", "black", "Rotation");

        ctx.fillStyle = "#FFF";
        util.fillCircle(ctx, box.cx, box.cy, box.r, Math.PI, 0);

        var rotText = (Math.abs(util.toDegrees(tank.gunrotation)- 180).toFixed(2) + "°");
        ctx.textAlign = "center";
        util.drawTextAt(ctx, box.cx, box.cy-20, "Courier", "14px", "black", rotText);

        ctx.save();
        ctx.strokeStyle = "#F00";
        ctx.lineWidth = 3;
        ctx.translate(box.cx, box.cy);
        ctx.rotate(tank.gunrotation - Math.PI/2);
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
        util.strokeCircle(ctx, box.cx, box.cy, box.r, Math.PI, 0);
        ctx.fillStyle = "#000";
        util.fillCircle(ctx, box.cx, box.cy, box.r/5, Math.PI,0);

        ctx.beginPath();
        ctx.moveTo(box.cx - box.r, box.cy+1);
        ctx.lineTo(box.cx + box.r, box.cy+1);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }


}
