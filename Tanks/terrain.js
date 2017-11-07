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


render: function(ctx, ls, frame) {

    ctx.fillStyle = "#228B22";
    var i = 0;
    ctx.beginPath();
    ctx.moveTo(0, ls[0]);

    for (i in ls) {
        ctx.lineTo(i, ls[i]);
    }

    ctx.lineTo(frame.width, frame.height);
    ctx.lineTo(0, frame.height);

    ctx.closePath();
    ctx.fill();
},

initlandScape: function(f, bound, xShift, frame) {

    var ls = [];

    var x = -bound + xShift;

    for (var i = 0; i < frame.width; i++) {
        var y = f(x);
        y += frame.height/2;
        ls.push(y);

        x += ((2*bound)/frame.width);
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


g_landscape = terrain.initlandScape(util.fun, bound, xShift, g_canvas);
