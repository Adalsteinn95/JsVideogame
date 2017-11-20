// ==========
// TERRAIN STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

//initial landscape values
function Terrain(descr) {


};
Terrain.prototype.g_landscape = [];
Terrain.prototype.bound = 20;
Terrain.prototype.tilt = function(x, degree) {
    return x * degree;
}

// landscape functions
Terrain.prototype.fun =  [
    function(x) { return 100 * Math.cos(x); },
    function(x) { return ((x*x) * Math.sin(x)); }
],

Terrain.prototype.rememberResets =  function () {
    // Remember my reset positions
    this.reset_landscape = this.landscape;
},

Terrain.prototype.update = function() {
  //nothing to do here
}
Terrain.prototype.render =  function(ctx,frame) {

    ctx.fillStyle = "#228B22";
    var i = 0;
    ctx.beginPath();
    ctx.moveTo(0, this.g_landscape[0]);

    for (i in this.g_landscape) {
        ctx.lineTo(i, this.g_landscape[i]);
    }

    ctx.lineTo(frame.width, frame.height);
    ctx.lineTo(0, frame.height);

    ctx.closePath();
    ctx.fill();
},

Terrain.prototype.initlandScape = function(f, xShift, frame) {
    this.bound = 20;
    this.bound *= Math.random();
    xShift *= Math.random() * this.bound;
    var roughness = Math.random() * 2;
    var t =  util.randRange(-30, 30);
    this.g_landscape = [];
    var x = -this.bound + xShift;
    var whoopsLandscapeIsOutOfBoundsLetsTryAgain = false;

    for (var i = 0; i < frame.width; i++) {
        var y = f(x) + this.tilt(x,t);
        y *= roughness;
        y += frame.height/2;

        if (y > frame.height || y < 0) {
            console.log("out of bounds, restarting");
            whoopsLandscapeIsOutOfBoundsLetsTryAgain = true;
            break;
        }
        this.g_landscape.push(y);
        x += ((2*this.bound)/frame.width);
    }
    if (whoopsLandscapeIsOutOfBoundsLetsTryAgain) {
        return false;
    } else {
        return this.g_landscape;
    }
},

Terrain.prototype.bombLandscape =  function(x, weapon) {
    var radius = weapon.damage
    if(weapon.name === "atom") {
      util.playSoundOverlap(g_audio.atom);
    }
    else {
      util.playSoundOverlap(g_audio.shotCollision);

    }
    var explosionRadius = radius;
    /*if (tankhit) {
        explosionRadius *= 2;
    }*/

    entityManager._explosions.push(new Explosion({
            cx : x,
            cy : entityManager._terrain[0].g_landscape[Math.floor(x)],
            radius : explosionRadius
        }));

    x = Math.floor(x);
    radius = Math.floor(radius);
    var diff = x - radius;
    var ratio = -1, step = 1/radius;

    for (var i = diff; i < 2*radius + diff; i++) {
        //if the explosion radius goes outside of the map then ignore
        if (i >= 0 && i <= g_canvas.width){
            entityManager._terrain[0].g_landscape[i] += util.sinAcos(ratio, radius);
        }
        ratio += step;
    }
}
