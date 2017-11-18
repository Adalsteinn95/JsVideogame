// ==========
// TERRAIN STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

//initial landscape values
var g_landscape = [];
var bound = 20;
var xShift = 1;
var tilt = function(x, degree) {
    return x * degree;
}

var terrain = {

// landscape functions
fun: [
    function(x, tilt) { return 100 + (-x*x); },
    function(x, tilt) { return 100 * (Math.cos(x)); },
    function(x, tilt) { return (x*x) * Math.sin(x); }
],

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
    bound *= Math.random();
    xShift *= Math.random() * bound;
    var roughness = Math.random() * 2;
    var t =  util.randRange(-25, 25);
    var ls = [];
    var x = -bound + xShift;
    var whoopsLandscapeIsOutOfBoundsLetsTryAgain = false;

    for (var i = 0; i < frame.width; i++) {
        var y = f(x, tilt) + tilt(x,t);
        y *= roughness;
        y += frame.height/2;

        if (y > frame.height || y < 0) {
            console.log("out of bounds, restarting");
            whoopsLandscapeIsOutOfBoundsLetsTryAgain = true;
            break;
        }
        ls.push(y);
        x += ((2*bound)/frame.width);
    }
    if (whoopsLandscapeIsOutOfBoundsLetsTryAgain) {
        return false;
    } else {
        return ls;
    }
},

bombLandscape: function(x, radius, tankhit) {
    var explosionRadius = radius;
    if (tankhit) {
        explosionRadius *= 2;
    }

    entityManager._explosions.push(new Explosion({
            cx : x,
            cy : g_landscape[Math.floor(x)],
            radius : explosionRadius
        }));

    x = Math.floor(x);
    radius = Math.floor(radius);

    var diff = x - radius;

    var ratio = -1, step = 1/radius;

    for (var i = diff; i < 2*radius + diff; i++) {

        //if the explosion radius goes outside of the map then ignore
        if (i < 0 || i > g_canvas.length){
          continue;
        }

        g_landscape[util.clamp(i)] += util.sinAcos(ratio, radius);
        ratio += step;
    }
}


}
