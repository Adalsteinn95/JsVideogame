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
  this.gunsprite = g_sprites.tankgun;

  // Set normal drawing scale, and warp state off
  this._scale = 1;
  this._isWarping = false;
};

Ship.prototype = new Entity();

Ship.prototype.rememberResets = function() {
  // Remember my reset positions
  this.reset_cx = this.cx;
  this.reset_cy = this.cy;
  this.reset_rotation = this.rotation;
};

Ship.prototype.KEY_THRUST = 'W'.charCodeAt(0);
Ship.prototype.KEY_RETRO = 'S'.charCodeAt(0);
Ship.prototype.KEY_LEFT = 'A'.charCodeAt(0);
Ship.prototype.KEY_RIGHT = 'D'.charCodeAt(0);
Ship.prototype.KEY_POWER = '5'.charCodeAt(0);
Ship.prototype.KEY_LESSPOWER = '4'.charCodeAt(0);

Ship.prototype.KEY_FIRE = ' '.charCodeAt(0);

// Initial, inheritable, default values
Ship.prototype.rotation = 0;
Ship.prototype.gunrotation = 0.7;
Ship.prototype.spriteGunRotation = -40;
Ship.prototype.cx = 200;
Ship.prototype.cy = 200;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 2;
Ship.prototype.numSubSteps = 1;
Ship.prototype.power = 2;
Ship.prototype.POWER_INCREASE = 0.085;
//Ship.prototype.weapon =  weapon.normal;

//true = heading right, false heading left
Ship.prototype.dir = true;

//is it this players turn?
Ship.prototype.myTurn = false;

//test fyrir spatialID
Ship.prototype.offsetX = 0;
Ship.prototype.offsetY = 0;


Ship.prototype.warp = function() {

  this._isWarping = true;
  this._scaleDirn = -1;
  //this.warpSound.play();

  // Unregister me from my old posistion
  // ...so that I can't be collided with while warping
  spatialManager.unregister(this);
};

Ship.prototype.update = function(du) {
  //update weapon if it has been changed
  if(this.weapon !== g_weapon){
    this.updateWeapon();
    console.log(this.weapon)
  };

  if (this._isDeadNow === true) {
    spatialManager.unregister(this);
    return entityManager.KILL_ME_NOW;
  }


  this.updatePower(du);

  // TODO: YOUR STUFF HERE! --- Unregister and check for death
  spatialManager.unregister(this);

  // Handle collisions
  //
  /*var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
        this.takeBulletHit();
    }*/

  // Perform movement substeps
  var steps = this.numSubSteps;
  var dStep = du / steps;
  for (var i = 0; i < steps; ++i) {
    this.computeSubStep(dStep);
  }

  // Handle firing
  this.maybeFireBullet();

  spatialManager.register(this);

};

Ship.prototype.computeSubStep = function(du) {

  if (thrust === 0 || g_allowMixedActions) {
    this.updateGunRotation(du);
  }
  this.updateRotation(du);
  /*if(this.rotation > 70){
    this.cx--;
    return;
  }
*/
  //
//

  var thrust = this.computeThrustMag();

  //falling down from a hill
  if((this.rotation < -50 && this.dir === true) || (this.rotation > 50 && this.dir === false)){

    thrust = this.falldown(thrust);
  }


  // Apply thrust directionally, based on our rotation
  var accelX = thrust;
  var accelY = thrust;

  //accelY += this.computeGravity();

  this.applyAccel(accelX, accelY, du);

  this.wrapPosition();

//


};


Ship.prototype.direction = function () {
    //óþarfi?
};

var NOMINAL_THRUST = +1;
var NOMINAL_RETRO = -1;

Ship.prototype.computeThrustMag = function() {

  var thrust = 0;
  if(this.myTurn === true ){
  if (keys[this.KEY_THRUST] && this.rotation > -85 && this.cx + this.sprite.width/2 < g_canvas.width){
    thrust += NOMINAL_THRUST;
    this.dir = true;
  }
  if (keys[this.KEY_RETRO] && this.rotation < 85 && this.cx - this.sprite.width/2 +10 > 0){
    thrust += NOMINAL_RETRO;
    this.dir = false;
  }
}

  return thrust;
};

Ship.prototype.applyAccel = function(accelX, accelY, du) {

  // s = s + v_ave * t
  this.cx += accelX;

  var xIndex = util.clamp(Math.floor(this.cx));
  this.cy = g_landscape[xIndex];
  if (this.cy > 600) {
    this.cy = 600;
  }
};

Ship.prototype.predictX = 0;
Ship.prototype.predictY = 0;
Ship.prototype.predictCord = [];


Ship.prototype.falldown = function(thrust) {
  //lalalalala
  if(this.dir === true){
    if(this.rotation > -78){
      thrust += NOMINAL_RETRO/3
    } else {thrust += NOMINAL_RETRO/2}
  }
  else {
    if(this.rotation < 78){
        thrust += NOMINAL_THRUST/3
      } else {thrust += NOMINAL_THRUST/2}
  }

  return thrust;

};

Ship.prototype.maybeFireBullet = function() {


  if (keys[this.KEY_FIRE] && this.myTurn === true) {

    this.myTurn = false;

    var dX = +Math.sin(this.gunrotation);
    var dY = -Math.cos(this.gunrotation);
    var launchDist = this.getRadius();

    var relVel = this.launchVel;
    var relVelX = dX * relVel;
    var relVelY = dY * relVel;

    var startVelX = this.power * relVelX + this.velX * this.power;
    var startVelY = -this.power * this.velY + relVelY * (this.power / 2);

    entityManager.fireBullet(this.cx + dX * launchDist, this.cy + dY * launchDist, startVelX, startVelY, this.spriteGunRotation);


    var volcanoMaster = this.weapon === weapons.volcano
    console.log('THIS.WEAPON === WEAPONS.VOLCANO', this.weapon === weapons.volcano)


    if(this.weapon === weapons.shower) {
      for (var i = -this.weapon.showerAmount/2; i < this.weapon.showerAmount/2; i++) {
        entityManager.fireBullet(this.cx + dX * launchDist - this.offsetX, this.cy + dY * launchDist - this.offsetY, startVelX, startVelY, this.gunrotation,true,i,false);
      }
    }
    else{
      entityManager.fireBullet(this.cx + dX * launchDist - this.offsetX, this.cy + dY * launchDist - this.offsetY, startVelX, startVelY, this.gunrotation, false, 0, volcanoMaster);

    }
    volcanoMaster = false;
  }
};

Ship.prototype.getRadius = function() {

  //return (this.sprite.width / 2) * 0.9;
  return (this.sprite.width / 2);
};

Ship.prototype.reset = function() {
  this.setPos(this.reset_cx, this.reset_cy);
  this.rotation = this.reset_rotation;

  this.halt();
};

Ship.prototype.halt = function() {
  this.velX = 0;
  this.velY = 0;
};

var NOMINAL_ROTATE_RATE = 0.01;

Ship.prototype.updateRotation = function(du) {



  //var xIndex1 = Math.floor(this.cx - w / 2);
  //var xIndex2 = Math.floor(this.cx + w / 2);
  var xIndex1 = Math.floor(this.cx - 5);
  var xIndex2 = Math.floor(this.cx + 5);
  xIndex1 = util.clamp(xIndex1);
  xIndex2 = util.clamp(xIndex2);


  //when it wraps we need to add canvas length so the tank doesnt spin
  var xLine = xIndex2;
  if (xLine < this.cx) {
    xLine = -1;
  } else {
    xLine = 1;
  }


  this.rotation = util.toDegrees(Math.atan2(g_landscape[xIndex2] - this.cy, (xIndex2 - this.cx) * xLine));
  //console.log(this.rotation);

};

Ship.prototype.updateGunRotation = function(du) {

  /*bullet trail prediction */
  this.predictCord = [];

  var dX = +Math.sin(this.gunrotation);
  var dY = -Math.cos(this.gunrotation);
  var launchDist = this.getRadius();

  var relVel = this.launchVel;
  var relVelX = dX * relVel;
  var relVelY = dY * relVel;

  var startVelX = this.power * relVelX + this.velX * this.power;
  var startVelY = -this.power * this.velY + relVelY * (this.power / 2);

  var testX = this.cx - this.offsetX + dX * launchDist;
  var testY = this.cy - this.offsetY + dY * launchDist;
  var veltestY = startVelY;


  while (testX < g_canvas.width || testX > g_canvas.width) {

    testX += startVelX;
    testY += veltestY;

    testX = util.clamp(testX);
    testY = testY;

    if (g_landscape[Math.floor(testX)] < testY) {
      break;
    };


    this.predictCord.push({testX, testY});


    veltestY += NOMINAL_GRAVITY;

  }

/*
  //this.power = 5;
  var destX = util.clamp(testX);
  var fakePower = this.power;


  if(Math.floor(destX) === 400){
  } else {
    if (Math.floor(destX) > 400 || 380 > Math.floor(destX)) {
        this.gunrotation += NOMINAL_ROTATE_RATE * 2;
        this.spriteGunRotation += 1.15;
        destX += startVelX;
        destX = util.clamp(destX);

        while(fakePower > 0){
          fakePower -= this.POWER_INCREASE;

          var d_X = +Math.sin(this.gunrotation);

          var relVelX = d_X * this.launchVel;

          var startVelX = fakePower * relVelX + this.velX * fakePower;
          destX += startVelX;

          if(Math.floor(destX) <= 400 && 380 <= Math.floor(destX)){
            this.power = fakePower;
          }
          if(fakePower < 0){
            break;
          }
        }

        while(fakePower < 10){
          fakePower += this.POWER_INCREASE;

          var dX = +Math.sin(this.gunrotation);

          var relVelX = dX * this.launchVel;

          var startVelX = fakePower * relVelX + this.velX * fakePower;
          destX += startVelX;

          if(Math.floor(destX) <= 400 && 380 <= Math.floor(destX)){
            this.power = fakePower;
          }
          if(fakePower > 10){
            break;
          }
        }


    }
  }*/







if(this.myTurn === true){
  if (keys[this.KEY_LEFT] && util.toDegrees(this.gunrotation) > -90) {

    this.gunrotation -= NOMINAL_ROTATE_RATE * 2;
    //this.spriteGunRotation -= 1.15;
  }
  if (keys[this.KEY_RIGHT] && util.toDegrees(this.gunrotation) < 90) {
    this.gunrotation += NOMINAL_ROTATE_RATE * 2;
    //this.spriteGunRotation += 1.15;
  }

  this.spriteGunRotation = util.toDegrees(this.gunrotation) - 90;
}
  //console.log(util.toDegrees(this.gunrotation));
  //console.log(this.spriteGunRotation);



};

Ship.prototype.updatePower = function(du) {
if(this.myTurn === true){
  if (keys[this.KEY_POWER]) {
    this.power += this.POWER_INCREASE/* du*/;
  }
  if (keys[this.KEY_LESSPOWER]) {
    this.power -= this.POWER_INCREASE/* du*/;
  }
}
};

Ship.prototype.resetPower = function(du) {
  this.power = 2;
};

Ship.prototype.updateWeapon = function() {
  this.weapon = g_weapon;
}

Ship.prototype.render = function(ctx) {
  var origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;
  //if rotation is big enough then translate by the x-axis
  var xOffset = 0;
  var yOffset;


  var xOffset = (Math.cos((this.rotation * Math.PI / 180) + 90)) * this.sprite.width / 2;
  var yOffset = (Math.sin((this.rotation * Math.PI / 180) + 90)) * this.sprite.height / 2;

  this.offsetX = xOffset;
  this.offsetY = yOffset;

  this.sprite.drawCentredAt(ctx, this.cx - (xOffset), this.cy - yOffset, this.rotation);
  //this.sprite.drawWrappedCentredAt(ctx, this.cx  , this.cy , this.rotation);

  this.gunsprite.drawGunCentredAt(ctx, this.cx - (xOffset )  , this.cy - yOffset , this.spriteGunRotation);

  this.sprite.scale = origScale;

  //==================
  ///Projectile path
  //===================

  ctx.beginPath();
  for (var i = 0; i < this.predictCord.length - 1; i++) {
    ctx.strokeStyle = '#ff0000';
    if (this.predictCord[i].testX - this.predictCord[i + 1].testX > 100 || this.predictCord[i + 1].testX - this.predictCord[i].testX > 100) {} else {
      ctx.moveTo(this.predictCord[i].testX, this.predictCord[i].testY);

      ctx.lineTo(this.predictCord[i + 1].testX, this.predictCord[i + 1].testY);
      ctx.lineWidth = 2;
    }
  }

  ctx.stroke();

};
