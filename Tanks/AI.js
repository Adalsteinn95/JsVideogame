"use strict"



var ai = {

  timer:  5000,

  getTargetX: function(ship){

    var targetx = ship.playerNr + 1;
    targetx %= entityManager._ships.length;
    //AI will not aim at a dead player
    //will get fixed once we have a winner screen
    while(entityManager._ships[targetx]._isDeadNow){
        targetx++
        targetx = util.clampMinMax(targetx, 0, entityManager._ships.length);
    }

    return entityManager._ships[targetx].cx
  },

  AIMovement: function(ship){
    /*movement of the AI */
    util.playSound(g_audio.drive);
    var thrust;

    if(Math.floor(ship.cx) > ship.nextX){

      ship.updateRotation();
      thrust = -1;

      if ((ship.rotation < -50) || (ship.rotation > 50)) {

        thrust = ship.falldown(thrust);
      }

      if( Math.floor(ship.cx) - ship.sprite.width / 2 + 10 > 0){
        ship.applyAccel(thrust);
      }
    } else if  (Math.floor(ship.cx) < ship.nextX){

        ship.updateRotation();
        thrust = 1;

        if ((ship.rotation < -50) || (ship.rotation > 50)) {

          thrust = ship.falldown(thrust);
        }

        if(Math.floor(ship.cx) + ship.sprite.width / 2 < g_canvas.width){
          ship.applyAccel(thrust);
        }
      }
    },

    AIpower: function(ship){

      if(ship.playerId === 'AI'){
        /*random power test for AI*/
        var x = Math.floor(Math.random() * 6) + 1
        ship.power = x;

      }
      /*if (ship.power >= 6) {
        power = "decrese";
      }

      if (ship.power <= 1) {

        power = "increse";
      }

      if (power === "increse") {
        ship.power += ship.POWER_INCREASE;
      }

      if (power === "decrese") {
        ship.power -= ship.POWER_INCREASE;
      }

        return power;*/

    },

  AIrotation: function(AIdirection, ship){

    /*Rotation of the AI gun*/
    if (Math.floor(util.toDegrees(ship.gunrotation)) >= ship.highAngle) {
      AIdirection = "left";
    }

    if (Math.floor(util.toDegrees(ship.gunrotation)) <= ship.lowAngle) {
      AIdirection = "right";
    }

    if (AIdirection === "left") {
      ship.gunrotation -= NOMINAL_ROTATE_RATE * 2;
    }

    if (AIdirection === "right") {
      ship.gunrotation += NOMINAL_ROTATE_RATE * 2;
    }

      ship.spriteGunRotation = util.toDegrees(ship.gunrotation) - 90;
      ship.spriteGunRotation += ship.rotation;
      return AIdirection;
  },

  AIupdate: function (destX, startVelX, direction, path, power){
    var ship = entityManager._ships[gameplayManager.activePlayerIndex];

    var targetx = this.getTargetX(ship);

    if(Math.floor(ship.cx) !== ship.nextX){
      //move to where it wants to go
      this.AIMovement(ship);

    }else{
        if (Math.floor(destX) < targetx && targetx - ship.learn < Math.floor(destX) || Math.floor(destX) < targetx && targetx + ship.learn < Math.floor(destX)) {

          if(Math.abs(targetx - ship.cx) < 100){
            //move and rotate and change power instead
            destX += startVelX;
            destX = util.clamp(destX, ship);

            if (ship.nextX > g_canvas.width -100){
              ship.path = 'left';
            } else if ( ship.nextX < 100){
              ship.path = 'right';
            }

            if ( ship.path === 'right'){
              ship.nextX += 50
            }else {
              ship.nextX -=50;
            }
            //move it
            this.AIMovement(ship);
            //calculate new angles
            this.getInitialValues(ship);
            direction = this.AIrotation(direction, ship);
            this.AIpower( ship);
            this.shipUpdate(destX, path, direction, ship);
            //change direction and run movement
          } else {

            util.stopSound(g_audio.drive);
            ship.maybeFireBullet();
            this.timer = 5000;
            if(ship.learn === 10){
              ship.learn += 10;
            }
            else if(40 >= ship.learn){
              ship.learn -= 1;
            } else {
              ship.learn -= 20;
            }

          }

        } else {
          destX += startVelX;
          destX = util.clamp(destX, ship);

          direction = this.AIrotation(direction, ship);
          this.AIpower(ship);
          this.shipUpdate(destX, path, direction, ship, power);
          this.timer--;
          if(this.timer < 4800){
            if (ship.nextX > g_canvas.width -100){
              ship.path = 'left';
            } else if ( ship.nextX < 100){
              ship.path = 'right';
            }
            if ( ship.path === 'right'){
              ship.nextX += 50
            }else {
              ship.nextX -=50;
            }
            util.clampMinMax(ship.nextX, 30, g_canvas.width - 40);

            this.timer = 5000;

            this.AIMovement(ship);
            this.getInitialValues(ship);
          }

    }
  }
},

  shipUpdate: function(destX, path, direction, ship, power){

    //update all the variables in ship
    ship.destX = destX;
    ship.AIdirection = direction;
    //ship.AIpath = path;
    ship.powerDir = power;
  },

//oldx = the current x coord of the ai tank, index is its player index
  whereToMove: function(oldx, index){
    //athuga breyta þetta í eitthvað sniðugt miðað við staðsetningar hinna
    //skriðdrekkann
    //decide whice direction to go, 50/50
    var num = 1
    /*50-50 that it will be a minus*/
    num *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

    var dist = Math.floor(Math.random()*100) + 50;
    dist *= num;

    return util.clampRange(oldx + dist, 33, g_canvas.width - 23);

  },
  //guess the height we need to shott
  guessHeight: function(x1, x2){
      var min;
      var max;
      var maxH = 0;
      if( x1 < x2){
        min = x1;
        max = x2
      } else {
        min = x2;
        max = x1;
      }
      for(min; min < max; min++){
        if(maxH > entityManager._terrain[0].g_landscape[min]){
          maxH = entityManager._terrain[0].g_landscape[min];
        }
      };
      return maxH - util.randInt(10,50);
  },

  getTarget: function(index){
    var length = entityManager._ships.length;
    var a = util.randInt(0,length-1);
    if (gameplayManager.countAlive() > 1) {
      while(entityManager._ships[a]._isDeadNow || a === index ){
        a = util.randInt(0,length);
      }
    }
    return a;
  },

  pickWeapon: function(tank){
    var int = util.randInt(1,101);

    if ( int < 65){

      tank.weapon = consts.weapons[0];

    } else if (int < 80){
      tank.weapon = consts.weapons[1];

    } else if ( int < 95){
      tank.weapon = consts.weapons[4]

    } else {
      tank.weapon = consts.weapons[2];

    }
  },

  //teh AI makes a calculated guess at first and uses that as a starting posistion
  getInitialValues: function(tank){

    //get a target that the AI wants to hit
    var targetIndex = this.getTarget(tank.playerNr);

    //guess a suitable maxheihgt it has to reach
    var y0 = this.guessHeight(tank.nextX, entityManager._ships[targetIndex].cx);
    //we have to change it because of how the canvas works
    y0 = g_canvas.height - y0;
    y0 -= (g_canvas.height - tank.cy);

    //calculate the distance between the target and the AI future posistion
    var distance = tank.nextX - entityManager._ships[targetIndex].cx;
    distance = -distance;

    //yVel required to reach max height
    var yVel = util.getVelY(y0, NOMINAL_GRAVITY);
    //time it takes to reach the top
    var timetoy = util.getTimeToHeight(yVel, NOMINAL_GRAVITY);

    //max height er hæðin frá byrjun að top gerum það - (endy - byrjunary)
    //calculate for teh diffrence in height between the shooter and the target
    var maxH = y0 - ((g_canvas.height - entityManager._ships[targetIndex].cy)-(g_canvas.height - tank.cy) );
    //calculate teh time it takes to reach the ground from top pos
    var timedown = util.getTimeDown(maxH,0.12)

    //total time
    var time = timedown + timetoy;
    //change to nominals
    time *= SECS_TO_NOMINALS;

    //the x Velocity
    var xVel = util.getVelX(distance,time, g_wind);
    //total velocity
    var vel = util.initialVelocity(xVel, yVel);

    //the 2 posible angles
    var angle1 = util.toDegrees(util.getAngle1(vel,distance,NOMINAL_GRAVITY)) ;

    var angle2 = util.toDegrees(util.getAngle2(vel,distance,NOMINAL_GRAVITY));

    angle1 = util.clampMinMax(angle1-90, 0,180);

    angle2 = util.clampMinMax(angle2-90, 0,180);

    var rot = this.getNextTankRotation(tank);
    //we might have to adjust the angle
    //depending on which direction the tank is rotationg and aiming
    if( rot < 0 && angle1 < 90 && angle2 < 90){
      angle1 += rot;
      angle2 += rot;
    }else if ( rot > 0 && angle1 > 90 && angle2 > 90){
      angle1 -= rot;
      angle2 -= rot;
    }

    var min;
    var max;
    angle1 = util.clampMinMax(angle1, 0,180);

    angle2 = util.clampMinMax(angle2, 0,180);

    //cant calculate angle the use 0- 180
    if(isNaN(angle1)){
      min = 0;
      max = 180;
    }else if(angle1 < angle2){
      min = angle1;
      max = angle2
    }else {
      min = angle2;
      max = angle1;
    }

    //sets the angle that the ai will search in.
    tank.lowAngle = min;
    tank.highAngle = max;

  },

  getNextTankRotation: function(tank){
    var rot;
    if(tank.cy < g_canvas.height){

      var xIndex1 = Math.floor(tank.nextX - 4);
      var xIndex2 = Math.floor(tank.nextX + 4);
      xIndex1 = util.clamp(xIndex1);
      xIndex2 = util.clamp(xIndex2);

      rot = util.toDegrees(Math.atan2(entityManager._terrain[0].g_landscape[xIndex2] - entityManager._terrain[0].g_landscape[xIndex1], (xIndex2 - xIndex1)));
    } else { rot = 0}

    return rot;
  },

  needToUpdateRotation : function(){

  }


     /*
        byrja á ða finna max height = s
        svo vel sem þarf y0 = sqrt(2*a*s)) þar sem a = gravity
        svo tímann til að ná hæstu hæð sem er tupp = y0 / g
        notum svo tdown = sqrt(2dist / g); dist er þá frá max height í targety
        t = tdown + tupp;
        svo þarf að margfalda til að fá Nominal time.
        distnace er targetx - this.cx
        x0 = distance/ t;
        vle er þá sqrt(x0^2 + y0^2);
        finnum svo angle:
        angle 1 = 0.5 * asin(g*d / v);  =21°
        angle 2 = util.toradian(90) - 0.5 * asin(g*d / v); = 69°
        power er þá : VEL = sqrt((power*4sin(angle))^2 + (((power/2)* -4cos(angle))^2);
        --> V^ 2 = (4Xsin(a)^2 - 2Xcos(a)^2)
        --> power = V^2 / 1- 3 cos(2a)

        erum með 2 angle sem við leitum á milli

        start by finding a suitable maxheihgt = s
        then yvel 0 sqrt(2*g*s) where g = KEY_GRAVITY
        then time upp. tupp = y0 / g
        then time down. tdown = sqrt(2dist / g)
        t = tdown + tupp.
        then get the nominal time : t *= nominaltime
        distance = targetx - this.cx
        xo = distance / t
        v = sqrt(x0^2 + yo^2)
        find 2 angles to search between
        angle 1 = 0.5 * asin(g*d / v);
        angle 2 = util.toradian(90) - 0.5 * asin(g*d / v);
        starting power is then V = sqrt((power*4sin(angle))^2 + (((power/2)* -4cos(angle))^2);
        --> V^ 2 = (4Xsin(a)^2 - 2Xcos(a)^2)
        --> power = V^2 / 1- 3 cos(2a)

        where a is the angle

     */


}
