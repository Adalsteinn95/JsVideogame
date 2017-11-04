"use strict";

var toolbar = {

    init : function() {
        this.drawBackground(dash_ctx);
    },

    drawBackground : function(ctx) {
        ctx.fillStyle = "#666";
        ctx.fillRect(0,0, g_dash.width, g_dash.height);
    },

    render : function(ctx) {
        this.drawBackground(ctx);
    },

    prompt : function(msg) {

    }


}
