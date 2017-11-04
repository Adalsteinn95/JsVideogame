"use strict";

var toolbar = {

    isDoorLocked : true,
    doorTranslate : 0,

    init : function() {
        this.gameDoor(g_ctx);
        this.drawBackground(dash_ctx);
    },

    render : function(ctx) {
        this.gameDoor(g_ctx);
    },

    drawBackground : function(ctx) {
        ctx.fillStyle = "#666";
        ctx.fillRect(0,0, g_dash.width, g_dash.height);
    },

    prompt : function(msg) {

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
    }
}
