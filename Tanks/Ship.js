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
Ship.prototype.launchVel = 4;
Ship.prototype.numSubSteps = 1;
Ship.prototype.power = 2;
Ship.prototype.POWER_INCREASE = 0.085;
Ship.prototype.weaponId =  0;

//is it this players turn?
Ship.prototype.myTurn = false;

//test fyrir spatialID
Ship.prototype.offsetX = 0;
Ship.prototype.offsetY = 0;

//hitpoints
Ship.prototype.health = 100;
//becomes true when hit, so the explosion doenst hit multiple times
Ship.prototype.isHit = false;

Ship.prototype.update = function(du) {
  //update weapon if it has been changed ÞARF AÐ BREYTA
  if (this.weapon !== g_weapon) {
    this.updateWeapon();
  };

  if (this._isDeadNow === true) {
    spatialManager.unregister(this);
    return entityManager.KILL_ME_NOW;
  }

  this.updatePower(du);

  spatialManager.unregister(this);

  // Handle collisions with other tank maybe
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

  if (this.playerId === "Human") {
    this.maybeFireBullet();
  }

  spatialManager.register(this);
};

Ship.prototype.computeSubStep = function(du) {

  if (thrust === 0 || g_allowMixedActions) {
    this.updateGunRotation(du);
  }
  this.updateRotation(du);

  var thrust = this.computeThrustMag();

  //falling down from a hill
  if ((this.rotation < -50/*&& this.dir === true*/) || (this.rotation > 50/*&& this.dir === false)*/)) {

    thrust = this.falldown(thrust);
  }

  // Apply thrust directionally, based on our rotation
  var accelX = thrust;
  var accelY = thrust;

  //accelY += this.computeGravity();

  this.applyAccel(accelX, accelY, du);

};

var NOMINAL_THRUST = +1;
var NOMINAL_RETRO = -1;

Ship.prototype.computeThrustMag = function() {
  //console.log(this.cx - this.sprite.width/2 +10);

  var thrust = 0;

  if (this.myTurn === true) {
    if (keys[this.KEY_THRUST] && this.rotation > -85 && this.cx + this.sprite.width / 2 < g_canvas.width) {
      thrust += NOMINAL_THRUST;
      this.dir = true;
    }
    if (keys[this.KEY_RETRO] && this.rotation < 85 && this.cx - this.sprite.width / 2 + 10 > 0) {
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
    this.rotation = 0;
  }
};

Ship.prototype.predictX = 0;
Ship.prototype.predictY = 0;
Ship.prototype.predictCord = [];

Ship.prototype.falldown = function(thrust) {
  //console.log(this.rotation);
  if (this.cx + this.sprite.width / 2 < g_canvas.width && this.cx - this.sprite.width / 2 + 10 > 0) {
    //heading upp a hill to the right
    if (this.rotation < -50) {

      //if(this.dir === true){
      if (this.rotation > -65) {

        thrust += NOMINAL_RETRO / 4

      } else if (this.rotation > -75) {
        thrust += NOMINAL_RETRO / 3
      } else {
        thrust += NOMINAL_RETRO / 2
      }
    }
    //hmmm
    if (this.rotation > 50) {
      //heading upp a hill to the right
      //if(this.dir === true){
      if (this.rotation < 65) {
        thrust += NOMINAL_THRUST / 4
      } else if (this.rotation < 75) {
        thrust += NOMINAL_THRUST / 3;
      } else {
        thrust += NOMINAL_THRUST / 2
      }
    }

  }

  return thrust;

};

Ship.prototype.maybeFireBullet = function() {

  if (keys[this.KEY_FIRE] && this.myTurn === true || this.myTurn === true && this.playerId === "AI") {

    this.myTurn = false;

    var dX = +Math.sin(this.gunrotation);
    var dY = -Math.cos(this.gunrotation);
    var launchDist = this.getRadius();

    var startVel = this.getStartVel(dX, dY);

    var volcanoMaster = this.weapon.name === "volcano";

    //console.log('THIS.WEAPON ', this.weapon )

    if(this.weapon.name === "shower") {
      //console.log('CONDITION PASSED')
      for (var i = -this.weapon.showerAmount/2; i < this.weapon.showerAmount/2; i++) {
        entityManager.fireBullet((this.cx + dX * launchDist) - this.offsetX, (this.cy + dY * launchDist) - this.offsetY + 100, startVel[0], startVel[1], this.spriteGunRotation,true,i,false);

      }
    } else {
      entityManager.fireBullet((this.cx + dX * launchDist) - this.offsetX, (this.cy + dY * launchDist) - this.offsetY, startVel[0], startVel[1], this.spriteGunRotation, false, 0, volcanoMaster);

    }
    volcanoMaster = false;
  }
};

Ship.prototype.getRadius = function() {
  //return (this.sprite.width / 2) * 0.9;
  return (this.sprite.width / 2);
};
//óþarfi?
Ship.prototype.reset = function() {
  this.setPos(this.reset_cx, this.reset_cy);
  this.rotation = this.reset_rotation;

};

var NOMINAL_ROTATE_RATE = 0.01;

Ship.prototype.updateRotation = function(du) {

  if(this.cy < g_canvas.height){

    //ATHUGA
  var xIndex1 = Math.floor(this.cx - 5);
  var xIndex2 = Math.floor(this.cx + 5);
  xIndex1 = util.clamp(xIndex1);
  xIndex2 = util.clamp(xIndex2);


  this.rotation = util.toDegrees(Math.atan2(g_landscape[xIndex2] - this.cy, (xIndex2 - this.cx) /** xLine*/));
} else { this.rotation = 0}


};

//calculates teh starting velocity and returnas an array with index 0 = x and 1 = y
Ship.prototype.getStartVel = function(dX, dY) {

  var relVel = this.launchVel;
  var relVelX = dX * relVel;
  var relVelY = dY * relVel;

  var startVelX = this.power * relVelX + this.velX * this.power;
  var startVelY = -this.power * this.velY + relVelY * (this.power / 2);

  var startVel = [startVelX, startVelY];
  return startVel;

}

Ship.prototype.updateGunRotation = function() {

  this.calculatePath();

  if (this.myTurn === true) {
    if (keys[this.KEY_LEFT] && util.toDegrees(this.gunrotation) > -90) {
      this.gunrotation -= NOMINAL_ROTATE_RATE * 2;
    }
    if (keys[this.KEY_RIGHT] && util.toDegrees(this.gunrotation) < 90) {
      this.gunrotation += NOMINAL_ROTATE_RATE * 2;
    }
    this.spriteGunRotation = util.toDegrees(this.gunrotation) - 90;
  }
};

Ship.prototype.AIdirection = "right";
Ship.prototype.AIpath = 0;
Ship.prototype.calculatePath = function() {
  if(this.playerId === 'AI'){
    /*random power test for AI*/
    var x = Math.floor(Math.random() * 6) + 1
    this.power = x;

  }
  /*bullet trail prediction */
  this.predictCord = [];

  var dX = +Math.sin(this.gunrotation);
  var dY = -Math.cos(this.gunrotation);
  var launchDist = this.getRadius();

  var startVel = this.getStartVel(dX, dY);

  var testX = this.cx - this.offsetX + dX * launchDist;
  var testY = this.cy - this.offsetY + dY * launchDist;
  var veltestY = startVel[1];
  var veltestX = startVel[0]

  while (testX < g_canvas.width || testX > g_canvas.width) {

    testX += veltestX;
    testY += veltestY;

    testX = util.clamp(testX);
    testY = testY;

    if (g_landscape[Math.floor(testX)] < testY) {
      break;
    };

    this.predictCord.push({testX, testY});

    veltestY += NOMINAL_GRAVITY;
    veltestX += g_wind;

  }


  var destX = util.clamp(testX);

  var targetx = this.playerNr + 1;

  targetx %= entityManager._ships.length;
  targetx = entityManager._ships[targetx].cx

  if (this.playerId === "AI") {
    if (this.myTurn === true) {
      if (Math.floor(destX) < targetx && targetx - 10 < Math.floor(destX) || Math.floor(destX) < targetx && targetx + 10 < Math.floor(destX)) {
        //&& targetx - this.cx > 50 || this.cx - targetx > 50
        //console.log(targetx);
        //console.log(this.cx);

        this.AIpath = 0;
        this.maybeFireBullet();
      } else {
        destX += startVel[0];
        destX = util.clamp(destX);
        /*Rotation of the AI*/
        if (Math.floor(util.toDegrees(this.gunrotation)) === 90) {
          this.AIdirection = "left";
        }

        if (Math.floor(util.toDegrees(this.gunrotation)) === -90) {
          this.AIdirection = "right";
        }

        if (this.AIdirection === "left") {
          this.gunrotation -= NOMINAL_ROTATE_RATE * 2;
        }

        if (this.AIdirection === "right") {
          this.gunrotation += NOMINAL_ROTATE_RATE * 2;
        }

        /*movement of the AI */
        if(this.AIpath === 0){
          /*generate 1 from 50*/
          //var num = Math.floor(Math.random()*100) + 1;
          var num = 0;
          if(targetx > this.cx){
            num = -200;
          } else {
            num = 200;
          }
          /*50-50 that it will be a minus*/
          //num *= Math.floor(Math.random()*2) == 1 ? 1 : -1
          this.AIpath = num;


        } else if(this.AIpath < 0){

          this.cx--;
          this.cx = util.clamp(this.cx);
          this.AIpath++;
        } else if(this.AIpath > 0){

          this.cx++;
          this.cx = util.clamp(this.cx);
          this.AIpath--;
        }

        /*
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
        }*/

      }

    }
  }

}

Ship.prototype.updatePower = function(du) {
  if (this.myTurn === true) {
    if (keys[this.KEY_POWER]) {
      this.power += this.POWER_INCREASE/* du*/;

    }
    if (keys[this.KEY_LESSPOWER]) {
      this.power -= this.POWER_INCREASE/* du*/;

    }
  }
};

Ship.prototype.takeBulletHit = function() {

    console.log("áái")
    //terrain.bombLandscape(this.cx, );
    this.health -= g_weapon.damage;
    //console.log(this.health);
};

Ship.prototype.takeExplosionHit = function(bombX, bombY) {
  if(!this.isHit){
      console.log("exp")
      //terrain.bombLandscape(this.cx, );
      //console.log(bombX);
      //console.log(bombY);
      //console.log(this.cx);
      //console.log(this.cy);
      var test = util.distCircles(this.cx, this.cy , bombX, bombY, this.getRadius(), 50)
      console.log(test);
      var range = Math.abs(util.distFromExplosion(this.cx, this.cy , bombX, bombY));
      console.log("fjarlægð frá sprengju " + range);
      //this.health -= (g_weapon.damage - range);

      this.health += test;
      console.log("lífið " + this.health);
      this.isHit = true;
    }


};

//ATHUGA
Ship.prototype.updateWeapon = function() {
  this.weapon = g_weapon;
}

Ship.prototype.render = function(ctx) {
  var origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;

  //console.log(this.rotation);
  var xOffset = (Math.cos((this.rotation * Math.PI / 180) + 90)) * this.sprite.width / 4;
  var yOffset = 0;

  yOffset = this.sprite.height / 2;

  //ATHUGA gera / 3 frekar?
  yOffset -= 6;

  this.offsetX = xOffset;
  this.offsetY = yOffset;

  this.sprite.drawCentredAt(ctx, this.cx - (xOffset), this.cy - yOffset, this.rotation);

  //this.spriteGunRotation += this.rotation
  this.gunsprite.drawGunCentredAt(ctx, this.cx - (xOffset), this.cy - yOffset, this.spriteGunRotation);

  this.sprite.scale = origScale;

  ///Projectile path

  util.projectilePath(this.predictCord);

};
