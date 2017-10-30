// ==========
// SHIP STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Ship(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();

    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.ship;

    // Set normal drawing scale, and warp state off
    this._scale = 1;
    this._isWarping = false;
};

Ship.prototype = new Entity();

Ship.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_rotation = this.rotation;
};

Ship.prototype.KEY_THRUST = 'W'.charCodeAt(0);
Ship.prototype.KEY_RETRO  = 'S'.charCodeAt(0);
Ship.prototype.KEY_LEFT   = 'A'.charCodeAt(0);
Ship.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);
Ship.prototype.KEY_POWER  = '5'.charCodeAt(0);

Ship.prototype.KEY_FIRE   = ' '.charCodeAt(0);

// Initial, inheritable, default values
Ship.prototype.rotation = 0;
Ship.prototype.gunrotation = -50;
Ship.prototype.cx = 200;
Ship.prototype.cy = 200;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 2;
Ship.prototype.numSubSteps = 1;
Ship.prototype.power = 10;


Ship.prototype.warp = function () {

    this._isWarping = true;
    this._scaleDirn = -1;
    //this.warpSound.play();

    // Unregister me from my old posistion
    // ...so that I can't be collided with while warping
    spatialManager.unregister(this);
};


Ship.prototype.update = function (du) {

    if(this._isDeadNow === true){
      spatialManager.unregister(this);
      return entityManager.KILL_ME_NOW;
    }

    // Handle warping
    if (this._isWarping) {
        this._updateWarp(du);
        return;
    }
    this.updatePower (du);

    // TODO: YOUR STUFF HERE! --- Unregister and check for death
    spatialManager.unregister(this);

    // TODO? NO, ACTUALLY, I JUST DID THIS BIT FOR YOU! :-)
    //
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
        this.takeBulletHit();
    }

    // Perform movement substeps
    var steps = this.numSubSteps;
    var dStep = du / steps;
    for (var i = 0; i < steps; ++i) {
        this.computeSubStep(dStep);
    }

    // Handle firing
    this.maybeFireBullet();


    // TODO: YOUR STUFF HERE! --- Warp if isColliding, otherwise Register
    spatialManager.register(this);

};

Ship.prototype.computeSubStep = function (du) {

    var thrust = this.computeThrustMag();

    // Apply thrust directionally, based on our rotation
    var accelX = /*+Math.sin(this.rotation) */ thrust;
    var accelY = /*-Math.cos(this.rotation) */ thrust;

    //accelY += this.computeGravity();

    this.applyAccel(accelX, accelY, du);

    this.wrapPosition();

    if (thrust === 0 || g_allowMixedActions) {
        this.updateGunRotation(du);
    }
    this.updateRotation(du);
};

//var NOMINAL_GRAVITY = 0.12;
/*
Ship.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};*/

var NOMINAL_THRUST = +1;
var NOMINAL_RETRO  = -1;

Ship.prototype.computeThrustMag = function () {

    var thrust = 0;

    if (keys[this.KEY_THRUST]) {
        thrust += NOMINAL_THRUST;
    }
    if (keys[this.KEY_RETRO]) {
        thrust += NOMINAL_RETRO;
    }

    return thrust;
};

Ship.prototype.applyAccel = function (accelX, accelY, du) {

    // s = s + v_ave * t
    //console.log(this.cx);
    this.cx += accelX;
    var Xindex = util.clamp(Math.floor(this.cx));
    this.cy = entityManager._categories[1][0].landscape[Xindex][1];
};

Ship.prototype.maybeFireBullet = function () {

    if (keys[this.KEY_FIRE]) {

        var dX = +Math.sin(this.gunrotation);
        var dY = -Math.cos(this.gunrotation);
        var launchDist = this.getRadius() * 1.2;
        console.log(launchDist);

        var relVel = this.launchVel;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;
        console.log(this.power);
          console.log(-this.power);

        entityManager.fireBullet(
           this.cx + dX * launchDist, this.cy + dY * launchDist,
           this.power * relVelX + this.velX, -this.power * this.velY + relVelY,
           this.gunrotation);

           //this.resetPower();

    }



};

Ship.prototype.getRadius = function () {
    return (this.sprite.width / 2) * 0.9;
};


Ship.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;

    this.halt();
};

Ship.prototype.halt = function () {
    this.velX = 0;
    this.velY = 0;
};

var NOMINAL_ROTATE_RATE = 0.01;

Ship.prototype.updateRotation = function (du) {

    //skítamix
    var w = 64,
        h = 64;

    var xIndex1 = Math.floor(this.cx-w/2);
    var xIndex2 = Math.floor(this.cx+w/2);
    xIndex1 = util.clamp(xIndex1);
    xIndex2 = util.clamp(xIndex2);

      //console.log(entityManager._categories[0][0].landscape[xIndex2][1]);
  //  this.rotation = 90 - util.toDegrees(Math.atan2(entityManager._categories[0][0].landscape[xIndex2][1],w/2));
    this.rotation = util.toDegrees(Math.atan2(entityManager._categories[1][0].landscape[xIndex2][1] - this.cy , entityManager._categories[1][0].landscape[xIndex2][0] - this.cx));

      //this.rotation += Math.atan2(entityManager._categories[0][0].landscape[xIndex2][1],w/2);
    //  console.log(util.toDegrees(this.rotation));

};

Ship.prototype.updateGunRotation = function (du) {
    if (keys[this.KEY_LEFT]) {
        this.gunrotation -= NOMINAL_ROTATE_RATE * du;
    }
    if (keys[this.KEY_RIGHT]) {
        this.gunrotation += NOMINAL_ROTATE_RATE * du;
    }
};

var POWER_INCREASE = 1;

Ship.prototype.updatePower = function (du) {
    if (keys[this.KEY_POWER]) {
        this.power += POWER_INCREASE * du;
    }

};

Ship.prototype.resetPower = function (du) {
      this.power = 2;
};

Ship.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    this.sprite.drawWrappedCentredAt(
	ctx, this.cx, this.cy, this.rotation
    );
    this.sprite.scale = origScale;
};
