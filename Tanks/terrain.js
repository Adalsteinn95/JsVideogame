// ==========
// TERRAIN STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/
var g_landscape = [];
var bound = 15;
var xShift = 0;


var terrain = {


rememberResets: function () {
    // Remember my reset positions
    this.reset_landscape = this.landscape;
},


render: function(ctx) {

    ctx.fillStyle = "#228B22";
    var i = 0;
    ctx.beginPath();
    ctx.moveTo(0, g_landscape[0]);

    for (i in g_landscape) {
        ctx.lineTo(i, g_landscape[i]);
    }

    ctx.lineTo(g_canvas.width, g_canvas.height);
    ctx.lineTo(0, g_canvas.height);

    ctx.closePath();
    ctx.fill();
},

initlandScape: function(ls, f, bound, xShift) {

    var x = -bound + xShift;

    for (var i = 0; i < g_canvas.width; i++) {
        var y = f(x);
        y += g_canvas.height/2;
        ls.push(y);

        x += ((2*bound)/g_canvas.width);
    }

    return ls;
},

bombLandscape: function(x, radius) {

    x = Math.floor(x);
    radius = Math.floor(radius);

    var diff = x - radius;

    var ratio = -1, step = 1/radius;

    for (var i = diff; i < 2*radius + diff; i++) {

        g_landscape[util.clamp(i)] += util.sinAcos(ratio, radius);
        ratio += step;
    }

    gameplayManager.nextTurn();
}


}


g_landscape = terrain.initlandScape(g_landscape, util.fun,bound,xShift);
