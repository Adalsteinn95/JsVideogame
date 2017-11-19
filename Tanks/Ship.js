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
  this.flagsprite = g_sprites.flag;
  this.arrowSprite = g_sprites.arrows;

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
Ship.prototype.weaponId =  0;
Ship.prototype.ammo = 1;

//AI stuff
Ship.prototype.destX = 0;
Ship.prototype.startVelX = 0;
Ship.prototype.AIdirection = "right";
Ship.prototype.AIpath = 0;
Ship.prototype.preMoveCalc = false;
Ship.prototype.nextX;
Ship.prototype.nextY;


//is it this players turn?
Ship.prototype.myTurn = false;

//test fyrir spatialID
Ship.prototype.offsetX = 0;
Ship.prototype.offsetY = 0;

//hitpoints
Ship.prototype.health = 100;

//becomes true when hit, so the explosion doesnt hit multiple times
//færa í bullet ?
Ship.prototype.isHit = false;
Ship.prototype.canFire = false;

Ship.prototype.update = function(du) {

  //if you only want one player to console log do it here
  /*if(this.myTurn){
    console.log("ammo " + this.ammo);
    console.log("cost " + this.weapon.cost)
    var check = this.checkAmmoCost();
    console.log(check);
  }*/

  // if a AI player has not done premove calculations then do it here
  if( this.playerId === 'AI' && !this.preMoveCalc){
      //spatialID -1 gets the index of the ship on entitymanager
      console.log(this._spatialID);
      ai.whereToMove(Math.floor(this.cx), util.clampRange(this._spatialID-1,0,8));
      this.preMoveCalc = true;
  }

  if (this._isDeadNow === true) {

    spatialManager.unregister(this);
    return entityManager.KILL_ME_NOW;
  }

  this.endTurn();

  //update weapon if it has been changed ÞARF AÐ BREYTA
  //used to check for dmg, need to know what weapon is being fired
  //can be fixed by getting the damage for the explosion entity or Bullet
  //ATHUGA
  if (this.weapon !== g_weapon) {
      //önnur föll kalla á g_weapon
      g_weapon = this.weapon;

  };

  if(this.playerId === "AI" && this.myTurn === true){
      //calculate teh path to get the DestX
      spatialManager.register(this);
      this.calculatePath();
      //
      ai.AIupdate(this.destX, this.startVelX, this.AIdirection, this.AIpath);
      //get y coordinates
      var xIndex = util.clamp(Math.floor(this.cx));
      this.cy = g_landscape[xIndex];
      if (this.cy > 600) {
        this.cy = 600;
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

    this.calculatePath();

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

  if (this.myTurn === true && this.playerId === "Human"  ) {
    if (keys[this.KEY_THRUST]  && this.cx + this.sprite.width / 2 < g_canvas.width) {
      thrust += NOMINAL_THRUST;
      this.dir = true;
    }
    if (keys[this.KEY_RETRO] && this.cx - this.sprite.width / 2 + 10 > 0) {
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

Ship.prototype.maybeFireBullet = function() {
  //check if the player has enough ammo for the chosen weapon
  this.canFire = this.checkAmmoCost();

  if ((keys[this.KEY_FIRE] && this.myTurn && this.playerId === "Human" && this.canFire) || this.myTurn && this.playerId === "AI" && this.canFire) {

    this.myTurn = false;

    var dX = +Math.sin(util.toRadian(this.spriteGunRotation));
    var dY = -Math.cos(util.toRadian(this.spriteGunRotation));
    console.log('THIS.SPRITEGUNROTATION', this.spriteGunRotation)
    var launchDist = this.getRadius();

    var startVel = this.getStartVel(dX, dY);

    var volcanoMaster = this.weapon.name === "volcano";

    //if shower then need to spawn more bullets right away
    if(this.weapon.name === "shower") {
      for (var i = -this.weapon.showerAmount/2; i < this.weapon.showerAmount/2; i++) {
        entityManager.fireBullet((this.cx + dX * launchDist) - this.offsetX, (this.cy + dY * launchDist) - this.offsetY , startVel[0], startVel[1], this.spriteGunRotation,true,i,false, this.weapon);

      }
    } else {
      entityManager.fireBullet((this.cx + dX * launchDist) - this.offsetX, (this.cy + dY * launchDist) - this.offsetY, startVel[0], startVel[1], this.spriteGunRotation, false, 0, volcanoMaster, this.weapon);

    }
    volcanoMaster = false;
    //decreacse amunition by the bullet cost
    this.ammo -= this.weapon.cost;
    this.canFire = false;
  }
};

Ship.prototype.endTurn = function() {


    if (keys[this.KEY_ENDTURN] && this.myTurn) {

      this.canFire = false;
      this.ammo *= 2;
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

Ship.prototype.updateRotation = function(du) {

  if(this.cy < g_canvas.height){

    //ATHUGA
  var xIndex1 = Math.floor(this.cx - 5);
  var xIndex2 = Math.floor(this.cx + 5);
  xIndex1 = util.clamp(xIndex1);
  xIndex2 = util.clamp(xIndex2);


  this.rotation = util.toDegrees(Math.atan2(g_landscape[xIndex2] - this.cy, (xIndex2 - this.cx)));
} else { this.rotation = 0}

};

//calculates the starting velocity and returnas an array with index 0 = x and 1 = y
Ship.prototype.getStartVel = function(dX, dY) {

  var relVel = this.launchVel;
  var relVelX = dX * relVel;
  var relVelY = dY * relVel;

  var startVelX = this.power * relVelX;
  var startVelY =  relVelY * (this.power / 2);

  var startVel = [startVelX, startVelY];
  return startVel;

}

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
  if(this.playerId === 'AI'){
    /*random power test for AI*/
    var x = Math.floor(Math.random() * 6) + 1
    this.power = x;

  }
  /*bullet trail prediction */
  this.predictCord = [];
  var dX = +Math.sin(util.toRadian(this.spriteGunRotation ));
  var dY = -Math.cos(util.toRadian(this.spriteGunRotation ));
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

    if (/*g_landscape[Math.floor(testX)]*/g_canvas.height < testY) {
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


};


Ship.prototype.updatePower = function(du) {
  if (this.myTurn === true) {
    /*if(this.power < 0.3){
      if (keys[this.KEY_POWER]) {
        this.power += this.POWER_INCREASE;

      }
    } else if(this.power >= 6){
      if (keys[this.KEY_LESSPOWER]) {
        this.power -= this.POWER_INCREASE;

      }
    } else {*/
      if (keys[this.KEY_POWER]) {
        this.power += this.POWER_INCREASE;

      }
      if (keys[this.KEY_LESSPOWER]) {
        this.power -= this.POWER_INCREASE;

      }
    }
  //}
};

Ship.prototype.takeBulletHit = function() {

    this.health -= g_weapon.damage;
    this.checkForDeath();

};

Ship.prototype.takeExplosionHit = function(bombX, bombY) {
  if(!this.isHit){

      var test = util.distCircles(this.cx, this.cy , bombX, bombY, this.getRadius(), g_weapon.damage);
      console.log(test);
      var range = Math.abs(util.distFromExplosion(this.cx, this.cy , bombX, bombY));
      console.log("fjarlægð frá sprengju " + range);

      this.health += test;
      console.log("lífið " + this.health);
      this.isHit = true;
      this.checkForDeath();
    }

};

Ship.prototype.checkForDeath = function() {
    console.log("ping");
    if (this.health <= 0){
      //add the death animation to the entity manager
      entityManager._explosions.push(new Death({
              cx : this.cx,
              cy : this.cy,
              radius : this.getRadius(),
              rotation : this.rotation
          }) );
      this._isDeadNow = true;
    }

};

//Check if the player has enough ammo to fire the chosen bullet
Ship.prototype.checkAmmoCost = function() {

  var weaponCost = this.weapon.cost;
  if(this.ammo >= weaponCost){
      return true;

  }

  return false;
};

//ATHUGA
Ship.prototype.updateWeapon = function() {
  if (this.myTurn === true) {
    if (keys[this.KEY_NEXTGUN]) {
      ++this.weaponId;
      this.weaponId = util.clampRange(this.weaponId,0,consts.weapons.length-1)

    }
    if (keys[this.KEY_PREVGUN]) {
      --this.weaponId;
      this.weaponId = util.clampRange(this.weaponId,0,consts.weapons.length-1)

    }

  }

  this.weapon = consts.weapons[this.weaponId];

};

Ship.prototype.render = function(ctx) {
  var origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;

  //to tranlate the flag to the right posistion
  var flagX = -8;
  var flagY = -11;
  var xOffset = (Math.cos((this.rotation * Math.PI / 180) + 90)) * this.sprite.width / 4;
  var yOffset = 0;

  yOffset = this.sprite.height / 2;

  //ATHUGA gera / 3 frekar?
  yOffset -= 6;

  this.offsetX = xOffset;
  this.offsetY = yOffset;

  //calc stöff ATHUGA
  var dX = +Math.sin(this.spriteGunRotation );
  var dY = -Math.cos(this.spriteGunRotation );

  var angle = this.spriteGunRotation - this.rotation;

  this.sprite.drawCentredAt(ctx, this.cx - (xOffset), this.cy - yOffset, this.rotation);

  //this.spriteGunRotation += this.rotation
  this.gunsprite.drawGunCentredAt(ctx, this.cx - (xOffset), this.cy - yOffset, this.spriteGunRotation - 90);

    this.flagsprite.drawIndicatorCentredAt(ctx, this.cx - (xOffset) , this.cy - yOffset , this.rotation, 0.05, flagX, flagY);

  this.sprite.scale = origScale;

  var startVel = this.getStartVel(dX, dY);

if(this.myTurn === true){
  //util.strokeCircle(g_ctx,this.cx - this.offsetX, this.cy - this.offsetY, util.maxHeightReached(util.initialVelocity(startVel[0], startVel[1]), angle,NOMINAL_GRAVITY));
  //util.strokeCircle(g_ctx,this.cx - this.offsetX, this.cy - this.offsetY, 3909);
  //var r = util.maxHeight(startVel[1], NOMINAL_GRAVITY, util.maxHeightTime(startVel[1], NOMINAL_GRAVITY ));

  //util.strokeCircle(g_ctx,this.cx - this.offsetX, this.cy - this.offsetY - r -20, 10);
  //console.log('THIS.CY - THIS.OFFSETY - R -20', this.cy - this.offsetY - r -20)
  //var hMax =  g_canvas.height - (this.cy - this.offsetY - r -20);

  //console.log('HMAX', hMax)

  //console.log(startVel[1]);
  //var xTime = util.xTravelTime(hMax,NOMINAL_GRAVITY);
  //console.log('XTIME', xTime)
  //var time = xTime +  util.maxHeightTime(-startVel[1], NOMINAL_GRAVITY );


// target x - this.cx / time = velX
/////////////////7
  /*var xDistance = time * startVel[0];
  //console.log('XDISTANCE', xDistance)
    util.strokeCircle(g_ctx,util.clamp(this.cx - this.offsetX + xDistance) , this.cy - this.offsetY, 10);
  var yOnHit =g_canvas.height - g_landscape[util.clamp(Math.floor(this.cx - this.offsetX + xDistance))-10];
  //console.log('YONHIT', yOnHit)

  hMax = g_canvas.height - (yOnHit - r -20);
  xTime = util.xTravelTime(hMax,NOMINAL_GRAVITY);
  time = xTime +  util.maxHeightTime(-startVel[1], NOMINAL_GRAVITY );
  xDistance = time * startVel[0];
  //console.log('XDISTANCEnytt', xDistance)

  util.fillCircle(g_ctx,util.clamp(this.cx - this.offsetX + xDistance) , this.cy - this.offsetY, 10);
*/g_ctx.fillStyle = 'red';
  util.fillCircle(g_ctx, 120 , 460, 10);
  util.fillCircle(g_ctx, 300 , 380, 10);
  //round 2
  //max hæðin sem við viljum ná ---ath þurfum fall sem gerir þetta
  var maxHeight = 150;
  //upphafsstaða skotsins
  var y0 = g_canvas.height - 380;
  //console.log('Y0 ', y0 );
  //staða targets
  var y1 = g_canvas.height - 430;
  //console.log('Y1', y1);
  //y vel sem þarf til að ná maxheight
  var Dyvel = util.getVelY(maxHeight, 0.12); //check
  //console.log('DYVEL', Dyvel)
  var timetoy = util.getTimeToHeight(Dyvel, 0.12); // check
  console.log('TIMETOY', timetoy)
  //max height er hæðin frá byrjun að top gerum það - (endy - byrjunary)
  var timedown = util.getTimeDown(100,0.12)
  console.log('TIMEDOWN', timedown)
  var time = timedown + timetoy;
  time *= SECS_TO_NOMINALS;
  console.log('TIME', time)


  var dVelX = util.getVelX(180,time);
  //console.log('VAR CALCVELX', dVelX);

  var dVEL = util.initialVelocity(dVelX, Dyvel);
  //console.log('CALCVEL', dVEL);

  var dAngle1 = util.getAngle1(dVEL,200,0.12);
  //console.log('DANGLE1 ', dAngle1 )
  var dAngle2 = util.getAngle2(dVEL,200,0.12);
  //console.log('DANGLE2', dAngle2)
  //console.log("this.rot " + this.spriteGunRotation);



  //var power1 = util.getPower(dVEL, dAngle1);
  //console.log('POWER', power1)
  var power2 = util.getPower(dVEL, dAngle2);
  console.log('POWER', power2)
  console.log('this.power', this.power)




  //round 1
  /*var calcVelY = util.getVelY(142, 0.12);
  //console.log("getvely " + util.getVelY(92, 0.12));
  var calcTime = util.getTimeToHeight(calcVelY, 0.12);
  //console.log("gettimetoheight " + util.getTimeToHeight(92, 0.12));
  //distance er -200
  var calcVelX = util.getVelX(200,time);
  //console.log('VAR CALCVELX', calcVelX);
  var calcVEL = util.initialVelocity(calcVelX, calcVelY);
  //console.log('CALCVEL', calcVEL)
  var calcAngle = util.getAngle(calcVEL,-200,0.12);
  console.log(this.spriteGunRotation);
  console.log('CALCANGLE', calcAngle);

  var thepower = util.angleOfReach(calcAngle, 0.12, -200);
  //console.log('THEPOWER', thepower)

  var calcdX = +Math.sin(util.toRadian(calcAngle ));
  //console.log('CALCDX', calcdX)
  var calcdY = -Math.cos(util.toRadian(calcAngle ));
  //console.log('CALCDY', calcdY)

  var thestpower = thepower / calcdX;
  console.log('THESTPOWER', thestpower);

  var power = util.getPower(calcAngle, calcVEL, calcdX, calcdY);
  //console.log('POWER', power)
  console.log("this.power " + this.power)
*/
}

  ///Projectile path

  util.projectilePath(this.predictCord);

};
