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


  // Default sprite, if not otherwise specified
  this.sprite = this.sprite || g_sprites.ship;
  this.gunsprite = g_sprites.tankgun;
  this.flagX = -19.35;
  this.flagY = -15;

  // Set normal drawing scale, and warp state off
  this._scale = 1;
  this._isWarping = false;
};

Ship.prototype = new Entity();


Ship.prototype.KEY_POWER = 'K'.charCodeAt(0);
Ship.prototype.KEY_LESSPOWER = 'J'.charCodeAt(0);
Ship.prototype.KEY_THRUST = 'D'.charCodeAt(0);
Ship.prototype.KEY_RETRO = 'A'.charCodeAt(0);
Ship.prototype.KEY_LEFT = 'S'.charCodeAt(0);
Ship.prototype.KEY_RIGHT = 'W'.charCodeAt(0);
Ship.prototype.KEY_PREVGUN = 'Z'.charCodeAt(0);
Ship.prototype.KEY_NEXTGUN = 'X'.charCodeAt(0);
Ship.prototype.KEY_ENDTURN = 'V'.charCodeAt(0);

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
Ship.prototype.weaponId = 0;
Ship.prototype.ammo = 20;

//AI stuff
Ship.prototype.destX = 0;
Ship.prototype.startVelX = 0;
Ship.prototype.AIdirection = "right";
Ship.prototype.AIpath = 'left';
Ship.prototype.preMoveCalc = false;
Ship.prototype.nextX;
Ship.prototype.nextY;
Ship.prototype.powerDir = "decrese";
Ship.prototype.calcAngle;
Ship.prototype.lowAngle;
Ship.prototype.highAngle;
Ship.prototype.learn = 100;

//is it this players turn?
Ship.prototype.myTurn = false;

//test fyrir spatialID
Ship.prototype.offsetX = 0;
Ship.prototype.offsetY = 0;

//hitpoints
Ship.prototype.health = 200;

//becomes true when hit, so the explosion doesnt hit multiple times
//færa í bullet ?
Ship.prototype.isHit = false;
Ship.prototype.canFire = false;

Ship.prototype.update = function(du) {


  // if a AI player has not done premove calculations then do it here
  if (this.playerId === 'AI' && !this.preMoveCalc) {

    //calculate the next posistion for the AI
    this.nextX = ai.whereToMove(Math.floor(this.cx), util.clampRange(this.playerNr, 0, 8));
    //calculate the initial Values.
    ai.getInitialValues(this);

    //set starting guessed angle
    this.spriteGunRotation = util.toRadian(this.highAngle);

    ai.pickWeapon(this);

    //calculations done
    this.preMoveCalc = true;
  }

  if (this.myTurn) {
    var check = this.checkAmmoCost();

  }

  if (this._isDeadNow === true) {

    spatialManager.unregister(this);
    return entityManager.KILL_ME_NOW;
  }

  this.endTurn();

  if (this.playerId === "AI" && this.myTurn === true) {
    //calculate teh path to get the DestX
    spatialManager.register(this);
    this.calculatePath();
    //
    ai.AIupdate(this.destX, this.startVelX, this.AIdirection, this.AIpath, this.powerDir);
    //get y coordinates
    var xIndex = util.clamp(Math.floor(this.cx));
    this.cy = entityManager._terrain[0].g_landscape[xIndex];
    if (this.cy > g_canvas.height) {
      this.cy = g_canvas.height;
      this.rotation = 0;
    }
    //ai stuff
  } else {

    //changes weapon for player
    this.updateWeapon();
    //changes the power for the player
    this.updatePower(du);

    //óþarfi bæta við ef við höfum tank on tank hitbox
    //spatialManager.unregister(this);

    // Perform movement substeps
    var steps = this.numSubSteps;
    var dStep = du / steps;
    for (var i = 0; i < steps; ++i) {
      this.computeSubStep(dStep);
    }
    if(this.weapon.name === "tracer" && this.lockedIn){
      this.calculatePath();
    }

    // Handle firing

    if (this.playerId === "Human") {
      this.maybeFireBullet();
    }

    spatialManager.register(this);
  }

};

Ship.prototype.computeSubStep = function(du) {

  if (thrust === 0 || g_allowMixedActions) {
    this.updateGunRotation(du);
  }
  this.updateRotation(du);

  var thrust = this.computeThrustMag();

  //falling down from a hill
  if ((this.rotation < -50) || (this.rotation > 50)) {

    thrust = this.falldown(thrust);
  }

  // Apply thrust directionally, based on our rotation
  var accelX = thrust;
  var accelY = thrust;

  this.applyAccel(accelX, accelY, du);

};

var NOMINAL_THRUST = +1;
var NOMINAL_RETRO = -1;

Ship.prototype.computeThrustMag = function() {

  var thrust = 0;

  if (this.myTurn === true && this.playerId === "Human") {

    if (keys[this.KEY_THRUST] && this.cx + this.sprite.width / 2 < g_canvas.width) {
      util.playSound(g_audio.drive);
      thrust += NOMINAL_THRUST;
      this.dir = true;
    } else if (keys[this.KEY_RETRO] && this.cx - this.sprite.width / 2 + 10 > 0) {
      util.playSound(g_audio.drive)
      thrust += NOMINAL_RETRO;
      this.dir = false;
    } else {
      util.stopSound(g_audio.drive);
    }
  }

  return thrust;
};

Ship.prototype.applyAccel = function(accelX, accelY, du) {

  // s = s + v_ave * t
  this.cx += accelX;

  var xIndex = util.clamp(Math.floor(this.cx));
  this.cy = entityManager._terrain[0].g_landscape[xIndex];
  if (this.cy > g_canvas.height) {
    this.cy = g_canvas.height;
    this.rotation = 0;
  }
};

Ship.prototype.predictX = 0;
Ship.prototype.predictY = 0;
Ship.prototype.predictCord = [];

Ship.prototype.falldown = function(thrust) {
  if (this.cx + this.sprite.width / 2 < g_canvas.width && this.cx - this.sprite.width / 2 + 10 > 0) {
    //heading upp a hill to the right
    if (this.rotation < -50) {

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

Ship.prototype.lockedIn = false;

Ship.prototype.maybeFireBullet = function() {

  //check if the player has enough ammo for the chosen weapon

  this.canFire = this.checkAmmoCost();

  if ((keys[this.KEY_FIRE] && this.myTurn && this.playerId === "Human" && this.canFire) || this.myTurn && this.playerId === "AI") {
    if (this.weapon.name === "tracer" && !this.lockedIn) {
      this.lockedIn = true;
    } else if (this.lockedIn && this.weapon.name === "tracer" || this.weapon.name !== "tracer") {
      this.lockedIn = false;
      util.playSoundOverlap(g_audio.fire);
      g_countdown.stop = true;

      g_weapon = this.weapon;

      this.myTurn = false;

      var dX = +Math.sin(util.toRadian(this.spriteGunRotation));
      var dY = -Math.cos(util.toRadian(this.spriteGunRotation));

      var launchDist = this.getRadius();

      var startVel = this.getStartVel(dX, dY);

      var volcanoMaster = this.weapon.name === "volcano";

      //if shower then need to spawn more bullets right away
      if (this.weapon.name === "shower") {
        for (var i = -this.weapon.showerAmount / 2; i < this.weapon.showerAmount / 2; i++) {
          entityManager.fireBullet((this.cx + dX * launchDist) - this.offsetX, (this.cy + dY * launchDist) - this.offsetY, startVel[0], startVel[1], this.spriteGunRotation, true, i, false, this.weapon);

        }
      } else {
        entityManager.fireBullet((this.cx + dX * launchDist) - this.offsetX, (this.cy + dY * launchDist) - this.offsetY, startVel[0], startVel[1], this.spriteGunRotation, false, 0, volcanoMaster, this.weapon);

      }
      volcanoMaster = false;
      //decreacse amunition by the bullet cost
      this.ammo -= this.weapon.cost;
      this.canFire = false;
    }
  }
};

Ship.prototype.endTurn = function() {

  if (keys[this.KEY_ENDTURN] && this.myTurn) {

    this.canFire = false;
    this.ammo += 5;
    this.myTurn = false;
    gameplayManager.nextTurn();
    keys[this.KEY_ENDTURN] = false;
  }

}

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

Ship.prototype.updateRotation = function() {

  if (this.cy < g_canvas.height) {

    //ATHUGA
    var xIndex1 = Math.floor(this.cx - 5);
    var xIndex2 = Math.floor(this.cx + 5);
    xIndex1 = util.clamp(xIndex1);
    xIndex2 = util.clamp(xIndex2);

    this.rotation = util.toDegrees(Math.atan2(entityManager._terrain[0].g_landscape[xIndex2] - this.cy, (xIndex2 - this.cx)));
  } else {
    this.rotation = 0
  }

};

//calculates the starting velocity and returnas an array with index 0 = x and 1 = y
Ship.prototype.getStartVel = function(dX, dY) {

  var relVel = this.launchVel;
  var relVelX = dX * relVel;
  var relVelY = dY * relVel;

  var startVelX = this.power * relVelX;
  var startVelY = relVelY * (this.power / 2);

  var startVel = [startVelX, startVelY];
  return startVel;

};

Ship.prototype.updateGunRotation = function() {

  if (this.myTurn === true) {
    if (keys[this.KEY_LEFT] && util.toDegrees(this.gunrotation) > 0) {
      this.gunrotation -= NOMINAL_ROTATE_RATE * 2;
    }
    if (keys[this.KEY_RIGHT] && util.toDegrees(this.gunrotation) < 180) {
      this.gunrotation += NOMINAL_ROTATE_RATE * 2;
    }
    this.spriteGunRotation = util.toDegrees(this.gunrotation) - 90;
    this.spriteGunRotation += this.rotation;
  }
};

Ship.prototype.calculatePath = function() {
  if(this._isDeadNow || entityManager._terrain.length === 0) {
    return;
  }


  if (this.lockedIn === true || this.playerId === 'AI') {
    /*bullet trail prediction */
    this.predictCord = [];
    var dX = +Math.sin(util.toRadian(this.spriteGunRotation));
    var dY = -Math.cos(util.toRadian(this.spriteGunRotation));
    var launchDist = this.getRadius();

    var startVel = this.getStartVel(dX, dY);

    var testX = this.cx - this.offsetX + dX * launchDist;
    var testY = this.cy - this.offsetY + dY * launchDist;
    var veltestY = startVel[1];
    var veltestX = startVel[0];

    this.predictCord.push({testX, testY});

    while (testX < g_canvas.width || testX > g_canvas.width) {


      testX += veltestX;
      testY += veltestY;

      testX = util.clamp(testX);
      testY = testY;

      if (entityManager._terrain[0].g_landscape[Math.floor(testX)] < testY) {
        break;
      };
      //projectile path
      this.predictCord.push({testX, testY});

      veltestY += NOMINAL_GRAVITY;
      veltestX += g_wind;

      //ath
      this.destX = util.clamp(testX);
      this.startVelX = startVel[0];
    }

  }

};

Ship.prototype.updatePower = function(du) {
  if (this.myTurn === true) {
    if(this.power < 0.3){
      if (keys[this.KEY_POWER]) {
        this.power += this.POWER_INCREASE;

      }
    } else if(this.power >= 6){
      if (keys[this.KEY_LESSPOWER]) {
        this.power -= this.POWER_INCREASE;

      }
    } else {
      if (keys[this.KEY_POWER]) {
        this.power += this.POWER_INCREASE;

    }
    if (keys[this.KEY_LESSPOWER]) {
      this.power -= this.POWER_INCREASE;

    }
  }
  }
};

Ship.prototype.takeBulletHit = function() {
  this.health -= g_weapon.damage;
  this.health = this.health < 0
    ? 0
    : this.health;
  this.checkForDeath();

};

Ship.prototype.takeExplosionHit = function(bombX, bombY) {
  if (!this.isHit) {

    var test = util.distCircles(this.cx, this.cy, bombX, bombY, this.getRadius(), g_weapon.damage);

    var range = Math.abs(util.distFromExplosion(this.cx, this.cy, bombX, bombY));

    this.health += test;
    this.isHit = true;
    this.health = this.health < 0
      ? 0
      : this.health;
    this.checkForDeath();
  }

};

Ship.prototype.checkForDeath = function() {
  if (this.health <= 0) {
    //add the death animation to the entity manager
    entityManager._explosions.push(new Death({cx: this.cx, cy: this.cy, radius: this.getRadius(), rotation: this.rotation}));
    this._isDeadNow = true;
  }

};

//Check if the player has enough ammo to fire the chosen bullet
Ship.prototype.checkAmmoCost = function() {

  var weaponCost = this.weapon.cost;
  if (this.ammo >= weaponCost) {
    return true;

  }

  return false;
};

//ATHUGA
Ship.prototype.updateWeapon = function() {
  if (this.myTurn === true) {
    if (keys[this.KEY_NEXTGUN] && !this.lockedIn) {
      ++this.weaponId;
      this.weaponId = util.clampRange(this.weaponId, 0, consts.weapons.length - 1)

    }
    if (keys[this.KEY_PREVGUN] && !this.lockedIn) {
      --this.weaponId;
      this.weaponId = util.clampRange(this.weaponId, 0, consts.weapons.length - 1)

    }

  }

  this.weapon = consts.weapons[this.weaponId];

};

Ship.prototype.render = function(ctx) {

  var origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;

  var xOffset = (Math.cos((this.rotation * Math.PI / 180) + 90)) * this.sprite.width / 4;
  var yOffset = 0;

  yOffset = this.sprite.height / 2;

  //ATHUGA gera / 3 frekar?
  yOffset -= 6;

  this.offsetX = xOffset;
  this.offsetY = yOffset;

  // til ad stytta linurnar adeins
  var x = this.cx - xOffset;
  var y = this.cy - yOffset;

  this.sprite.drawCentredAt(ctx, x, y, this.rotation);

  //this.spriteGunRotation += this.rotation
  this.flagsprite.drawFlag(ctx, x, y, 16, 10, this.rotation, this.flagX, this.flagY);

  this.gunsprite.drawGunCentredAt(ctx, x, y, this.spriteGunRotation - 90);

  this.sprite.scale = origScale;

  ///Projectile path
  if (this.weapon.name === "tracer" && this.lockedIn === true) {
    util.projectilePath(this.predictCord);
  }

};
