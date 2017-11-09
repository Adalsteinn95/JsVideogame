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
    _ : {
        numPlayers : 2,
        maxPlayers : 4,
        minPlayers : 2,
        playerIndex : 0,
        humanOrAI : false,

        previewBox : {
            cx : 360,
            cy : 40,
            width : g_canvas.width/5,
            height : g_canvas.height/5
        },
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

        var box = this._.previewBox;

        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black",
                        "Map preview:");

        util.fillBox(ctx, box.cx, box.cy, box.width, box.height, "#ADD8E6");

        ctx.save();
        ctx.translate(box.cx, box.cy);
        ctx.scale(0.2, 0.2);
        terrain.render(ctx, g_landscape, g_canvas);

        ctx.restore();

        util.strokeBox(ctx, box.cx, box.cy, box.width, box.height, "black");

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
        util.drawTextAt(ctx, 50, 30, "Courier", "25px", "black",
        "Turn " + gameplayManager._.turn +
        ": player " + parseInt(gameplayManager.activePlayerIndex+1));
        this.renderWeapon(ctx);
        this.renderPower(ctx);
    },

    renderWeapon : function(ctx) {
        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black",
                        "Weapon: " + g_weapon.constructor.name);

        if (eatKey(this.KEY_PLUS)) {
            //next weapon
        }
        if (eatKey(this.KEY_MINUS)) {
            //previous weapon
        }
    },

    renderPower : function(ctx) {
        util.drawTextAt(ctx, 300, 75, "Courier", "25px", "black",
                        "POWER");
        toolbarUtil.drawPowerBar(ctx, 300, 75);

        //console.log(entityManager._ships[gameplayManager.activePlayerIndex].power);
    }


}
