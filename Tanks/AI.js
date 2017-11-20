"use strict"



var ai = {

  timer:  1000,

  runAI: function(destX, startVelX, direction, path,){
    //fær inn öll gildi frá ships sem þarf og kallar svo á hin föllinn með þeim
    //þá þarf bara eitt kall í ships
    //implementa seinast
    //timer?
    //óþarfi
    AIupdate(destX, startVelX, direction, path, timer);

  },

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

    AIpower: function(power, ship){

      if (ship.power >= 6) {
        power = "decrese";
      }

      if (ship.power <= 1) {

        power = "increse";
      }

      if (power === "increse") {
        ship.power += ship.POWER_INCREASE;
        console.log('SHIP.POWER', ship.power)
      }

      if (power === "decrese") {
        ship.power -= ship.POWER_INCREASE;
        console.log('SHIP.POWER', ship.power)
      }

        return power;

    },

  AIrotation: function(AIdirection, ship){
    console.log('SHIP', ship.playerNr)

    /*Rotation of the AI gun*/
    console.log('SHIP.HIGHANGLE', ship.highAngle)
    if (Math.floor(util.toDegrees(ship.gunrotation)) >= ship.highAngle) {

      AIdirection = "left";
    }

    console.log('SHIP.LOWANGLE', ship.lowAngle)
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
    if(this.timer < 0){
      ship.maybeFireBullet();
      this.timer = 1000;
    }
    this.timer--;
    if(Math.floor(ship.cx) !== ship.nextX){
      //move to where it wants to go
      this.AIMovement(ship);

    }else{

        if (Math.floor(destX) < targetx && targetx - 20 < Math.floor(destX) || Math.floor(destX) < targetx && targetx + 20 < Math.floor(destX)) {
          //&& targetx - this.cx > 50 || this.cx - targetx > 50

          //console.log(Math.abs(targetx - entityManager._ships[gameplayManager.activePlayerNr].cx));
          if(Math.abs(targetx - ship.cx) < 50){
            console.log("dont shoot");
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
            //power = this.AIpower(power, ship);
            this.shipUpdate(destX, path, direction, ship);
            //change direction and run movement
          } else {
            ship.maybeFireBullet();
            this.timer = 1000;
          }

        } else {
          destX += startVelX;
          destX = util.clamp(destX, ship);
          //path = this.AIMovement(path, ship);
          direction = this.AIrotation(direction, ship);
          //power = this.AIpower(power, ship);
          this.shipUpdate(destX, path, direction, ship, power);


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

    return util.clampRange(oldx + dist, 0, g_canvas.width);

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
        if(maxH > g_landscape[min]){
          maxH = g_landscape[min];
        }
      };
      return maxH - util.randInt(10,50);
  },

  getTarget: function(index){
    var length = entityManager._ships.length;
    var a = util.randInt(0,length-1);
    while(entityManager._ships[a]._isDeadNow || a === index ){
      a = util.randInt(0,length);
    }
    return a;
  },

  //teh AI makes a calculated guess at first and uses that as a starting posistion
  getInitialValues: function(tank){
    var targetIndex = this.getTarget(tank.playerNr);
    //console.log('TARGETINDEX', targetIndex)
    var y0 = this.guessHeight(tank.nextX, entityManager._ships[targetIndex].cx);
    y0 = g_canvas.height - y0;
    y0 -= (g_canvas.height - tank.cy);
    //console.log('Y0', y0)
    var distance = tank.nextX - entityManager._ships[targetIndex].cx;
    distance = -distance;

    //y vel sem þarf til að ná maxheight
    var yVel = util.getVelY(y0, NOMINAL_GRAVITY); //check
    //console.log('DYVEL', Dyvel)
    var timetoy = util.getTimeToHeight(yVel, NOMINAL_GRAVITY); // check
    //console.log('TIMETOY', timetoy)
    //max height er hæðin frá byrjun að top gerum það - (endy - byrjunary)
    var maxH = y0 - ((g_canvas.height - entityManager._ships[targetIndex].cy)-(g_canvas.height - tank.cy) );
    //console.log('MAXH', maxH)
    var timedown = util.getTimeDown(maxH,0.12)
    //console.log('TIMEDOWN', timedown)
    var time = timedown + timetoy;
    time *= SECS_TO_NOMINALS;
    //console.log('TIME', time)


    var xVel = util.getVelX(distance,time, g_wind);
    //console.log('VAR CALCVELX', dVelX);

    var vel = util.initialVelocity(xVel, yVel);

    var angle1 = util.toDegrees(util.getAngle1(vel,distance,NOMINAL_GRAVITY)) + 90;
    //console.log('DANGLE1 ', angle1 )
    var angle2 = util.toDegrees(util.getAngle2(vel,distance,NOMINAL_GRAVITY)) + 90;
    //console.log('DANGLE2', angle2)
    var min;
    var max;
    angle1 = util.clampMinMax(angle1, 0,180);
    console.log('ANGLE1', angle1)
    angle2 = util.clampMinMax(angle2, 0,180);
    console.log('ANGLE2', angle2);

    //cant calculate angle the use 0- 180
    if(angle1 == false){
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

  }




}
