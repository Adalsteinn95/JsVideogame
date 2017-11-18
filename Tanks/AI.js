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

  getTarget: function(ship){

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
    console.log("currentx " + Math.floor(ship.cx))
    console.log("nextX " + ship.nextX);

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

  AIrotation: function(AIdirection, ship){

    /*Rotation of the AI gun*/
    if (Math.floor(util.toDegrees(ship.gunrotation)) >= 180) {
      AIdirection = "left";
    }

    if (Math.floor(util.toDegrees(ship.gunrotation)) <= 0) {

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

  AIupdate: function (destX, startVelX, direction, path){
    var ship = entityManager._ships[gameplayManager.activePlayerIndex];

    var targetx = this.getTarget(ship);
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
            //move and rotate instead
            destX += startVelX;
            destX = util.clamp(destX, ship);
          //  path = this.AIMovement(path, ship);
            direction = this.AIrotation(direction, ship);
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
          this.shipUpdate(destX, path, direction, ship);

    }
  }
},

  shipUpdate: function(destX, path, direction, ship){

    //update all the variables in ship
    ship.destX = destX;
    ship.AIdirection = direction;
    ship.AIpath = path;
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
    console.log("dist " + dist);
    dist *= num;
    console.log("dist " + dist);
    //ATHUGA
    /////
    console.log("dist " + dist);
    entityManager._ships[index].nextX = util.clampRange(oldx + dist, 0, g_canvas.width);
  },
  //guess the height we need to shott
  guessHeight: function(tank){
    //seinna fá inn y hnit á target og y hnit á stærsta fjall á milli targets
      var num = Math.florr(Math.random()*200 )+40;
      return tank.cy- num;
  },




}
