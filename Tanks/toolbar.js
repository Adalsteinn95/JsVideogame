"use strict";

var toolbar = {

    infoString : "testing hello",
    setupReady : false,
    setupIndex : 0,

    KEY_PLUS : 'D'.charCodeAt(0),
    KEY_MINUS : 'A'.charCodeAt(0),
    KEY_CONFIRM : '13', //'enter'-keycode
    KEY_BACK : '8', //'backspace'-keycode

    _ : {
        topics : 3,
        numPlayers : 2,
        maxPlayers : 4,
        minPlayers : 2
    },



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

        if (keys[this.KEY_CONFIRM] && this.setupIndex < this._.topics-1) {
            this.setupIndex++;
        }
        if (keys[this.KEY_BACK] && this.setupIndex > 0) {
            this.setupIndex--;
        }
        console.log(this.setupIndex);
    },

    renderNumPlayer : function(ctx) {
        util.drawTextAt(ctx, 50, 75, "Courier", "20px", "black",
                        "Number of players");
        util.drawTextAt(ctx, 50, 100, "Courier", "20px", "black",
                        this._.numPlayers);

        if (keys[this.KEY_PLUS] && this._.numPlayers < this._.maxPlayers) {
            this._.numPlayers++;
        }
        if (keys[this.KEY_MINUS] && this._.numPlayers > this._.minPlayers) {
            this._.numPlayers--;
        }

        if (keys[this.KEY_TEST]) {
            console.log("virkar");
        }
    },

    renderPlayerSetup : function() {

    },

    renderMapPreview : function() {

    },

    //////////////////////////
    ///  SETUP READY STUFF ///
    //////////////////////////

    renderToolbar : function(ctx) {

    }


}
