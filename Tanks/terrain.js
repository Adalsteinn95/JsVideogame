// ==========
// TERRAIN STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Terrain(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    this.initlandScape(this.landscape, this.function, this.bound, this.xShift);
    this.rememberResets();

};

Terrain.prototype = new Entity();

Terrain.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_landscape = this.landscape;
};

Entity.prototype.findHitEntity = function () {
  //do nothing, we handle the terrain collision diffrently
};

Entity.prototype.update = function () {
  //do nothing for now until we get the bullets working
}

Terrain.prototype.render = function(ctx) {

    ctx.fillStyle = "blue";

    var i = 0;
    ctx.beginPath();
    ctx.moveTo(this.landscape[0], this.landscape[1]);

    for (i in this.landscape) {
        ctx.lineTo(this.landscape[i][0], this.landscape[i][1]);
    }

    ctx.closePath();
    ctx.fill();
}

Terrain.prototype.initlandScape = function(ls, f, bound, xShift) {

    var x = -bound + xShift;

    for (var i = 0; i < g_canvas.width; i++) {
        var y = f(x);
        y += g_canvas.height/2;
        ls.push([i,y]);

        x += ((2*bound)/g_canvas.width);
    }

    ls.push([g_canvas.width,g_canvas.height]);
    ls.push([0,g_canvas.height]);
    console.log(ls);
    return ls;
}

Terrain.prototype.bombLandscape = function(x, radius) {

    x = Math.floor(x);
    radius = Math.floor(radius);

    var diff = x - radius;

    var ratio = -1, step = 1/radius;

    for (var i = diff; i < 2*radius + diff; i++) {
        this.landscape[i][1] += util.sinAcos(ratio, radius);
        ratio += step;
    }
}