"use strict";

var toolbar = {

    infoString : "testing hello",
    setupReady : false,
    setupIndex : 0,

    KEY_PLUS : 'D'.charCodeAt(0),
    KEY_MINUS : 'A'.charCodeAt(0),
    KEY_CONFIRM : '13', //'enter'-keycode
    KEY_BACK : '8', //'backspace'-keycode

    //various private variables
    _ : {
        numPlayers : 2,
        maxPlayers : 4,
        minPlayers : 2,
        playerIndex : 0,
        humanOrAI : false
    },

    playerIdSetup : [],

    init : function() {
        this.drawBackground(dash_ctx);
    },

    drawBackground : function(ctx) {
        ctx.fillStyle = "#666";
        ctx.fillRect(0,0, g_dash.width, g_dash.height);
    },

    drawInfo : function(ctx) {
        ctx.save();
        ctx.font = "30px Courier";
        ctx.fillStyle = "black";
        ctx.fillText(this.infoString, 50, 50);
        ctx.restore();
    },

    render : function(ctx) {
        this.drawBackground(ctx);
        this.setupReady ? this.renderToolbar(ctx) : this.renderSetup(ctx);
        this.drawInfo(ctx);
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

        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black",
                        "Map preview:");

        util.fillBox(ctx, 360, 40, 180, 120, "#ADD8E6");

        ctx.save();
        // draw landscape preview
        ctx.restore();

        util.strokeBox(ctx, 360, 40, 180, 120, "black");

        if (eatKey(this.KEY_CONFIRM)) {
            this.setupReady = true;
            gameplayManager.init();
            gameplayManager.isDoorLocked = false;
        }

    },

    //////////////////////////
    ///  SETUP READY STUFF ///
    //////////////////////////

    renderToolbar : function(ctx) {

    }


}
