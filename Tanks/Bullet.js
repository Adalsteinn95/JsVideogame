// ======
// BULLET
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Bullet(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();

/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Bullet.prototype = new Entity();


// Initial, inheritable, default values
Bullet.prototype.rotation = 0;
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 1;
Bullet.prototype.velY = 1;

// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

var NOMINAL_GRAVITY = 0.12;

Bullet.prototype.update = function (du) {

    // TODO: YOUR STUFF HERE! --- Unregister and check for death
    spatialManager.unregister(this);

    this.lifeSpan -= du;
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.velY += NOMINAL_GRAVITY;

    this.rotation += 1 * du;
    this.rotation = util.wrapRange(this.rotation,
                                   0, consts.FULL_CIRCLE);

    this.wrapPosition();

    // TODO? NO, ACTUALLY, I JUST DID THIS BIT FOR YOU! :-)
    //
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
        return entityManager.KILL_ME_NOW;
    };

    //terrain hit first edition
    this.terrainHit(this.cx, this.cy);
    //skítamix
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;


    // TODO: YOUR STUFF HERE! --- (Re-)Register
    spatialManager.register(this);
};

Bullet.prototype.terrainHit = function(x, y){
  var xIndex = util.clamp(Math.floor(x));

  //console.log(entityManager._categories[1][0].landscape[xIndex][1]);
  //console.log(y);
  if(entityManager._categories[1][0].landscape[xIndex][1] < y){
    entityManager._terrain[0].bombLandscape(x, 50);
    //this.kill();
    this.lifeSpan = 0;
  }
};

Bullet.prototype.getRadius = function () {
    return 4;
};

Bullet.prototype.takeBulletHit = function () {
    this.kill();

    // Make a noise when I am zapped by another bullet
    //this.zappedSound.play();
};

Bullet.prototype.render = function (ctx) {

    var fadeThresh = Bullet.prototype.lifeSpan / 3;

    /*if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }*/

    g_sprites.bullet.drawWrappedCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );

    ctx.globalAlpha = 1;
};
