"use strict"



var ai = {


  runAi: function(destX, startVelX, direction, path){
    //fær inn öll gildi frá ships sem þarf og kallar svo á hin föllinn með þeim
    //þá þarf bara eitt kall í ships
    //implementa seinast
    //timer?
    Aiupdate(destX, startVelX, direction, path);

  },

  getTarget: function(){

    var targetx = entityManager._ships[gameplayManager.activePlayerIndex].playerNr + 1;
    targetx %= entityManager._ships.length;
    //AI will not aim at a dead player
    //will get fixed once we have a winner screen
    while(entityManager._ships[targetx]._isDeadNow){
      targetx++
      targetx = util.clampMinMax(targetx, 0, entityManager._ships.length);
    }

    return entityManager._ships[targetx].cx
  },

  AIMovement: function(AIpath){
    /*movement of the AI */
    var thrust;
    if(AIpath === 0){
      /*generate 1 from 50*/
      //var num = Math.floor(Math.random()*100) + 1;
      var num = 150;
      /*50-50 that it will be a minus*/
      num *= Math.floor(Math.random()*2) == 1 ? 1 : -1
      AIpath = num;

    } else if(AIpath < 0){

      entityManager._ships[gameplayManager.activePlayerIndex].updateRotation();
      thrust = -1;

      if ((entityManager._ships[gameplayManager.activePlayerIndex].rotation < -50) || (entityManager._ships[gameplayManager.activePlayerIndex].rotation > 50)) {

        thrust = entityManager._ships[gameplayManager.activePlayerIndex].falldown(thrust);
      }

      if( entityManager._ships[gameplayManager.activePlayerIndex].cx - entityManager._ships[gameplayManager.activePlayerIndex].sprite.width / 2 + 10 > 0){
      entityManager._ships[gameplayManager.activePlayerIndex].applyAccel(thrust);
          AIpath++;
    } else { AIpath = 150}


    } else if(AIpath > 0){

      entityManager._ships[gameplayManager.activePlayerIndex].updateRotation();
      thrust = 1;

      if ((entityManager._ships[gameplayManager.activePlayerIndex].rotation < -50) || (entityManager._ships[gameplayManager.activePlayerIndex].rotation > 50)) {

        thrust = entityManager._ships[gameplayManager.activePlayerIndex].falldown(thrust);
      }

      if(entityManager._ships[gameplayManager.activePlayerIndex].cx + entityManager._ships[gameplayManager.activePlayerIndex].sprite.width / 2 < g_canvas.width){
      entityManager._ships[gameplayManager.activePlayerIndex].applyAccel(thrust);
      AIpath--;
    }else { AIpath = -150}

    }

    return AIpath;
  },

  AIrotation: function(AIdirection){

    /*Rotation of the AI gun*/
    if (Math.floor(util.toDegrees(entityManager._ships[gameplayManager.activePlayerIndex].gunrotation)) >= 180) {
      AIdirection = "left";
    }

    if (Math.floor(util.toDegrees(entityManager._ships[gameplayManager.activePlayerIndex].gunrotation)) <= 0) {

      AIdirection = "right";
    }

    if (AIdirection === "left") {
      entityManager._ships[gameplayManager.activePlayerIndex].gunrotation -= NOMINAL_ROTATE_RATE * 2;
    }

    if (AIdirection === "right") {
      entityManager._ships[gameplayManager.activePlayerIndex].gunrotation += NOMINAL_ROTATE_RATE * 2;
    }

      entityManager._ships[gameplayManager.activePlayerIndex].spriteGunRotation = util.toDegrees(entityManager._ships[gameplayManager.activePlayerIndex].gunrotation) - 90;
      entityManager._ships[gameplayManager.activePlayerIndex].spriteGunRotation += entityManager._ships[gameplayManager.activePlayerIndex].rotation;
      return AIdirection;
  },

  AIupdate: function (destX, startVelX, direction, path, timer){

    var targetx = this.getTarget();

    //if (this.playerId === "AI") {
    //  if (this.myTurn === true) {
        if (Math.floor(destX) < targetx && targetx - 20 < Math.floor(destX) || Math.floor(destX) < targetx && targetx + 20 < Math.floor(destX)) {
          //&& targetx - this.cx > 50 || this.cx - targetx > 50

          //console.log(Math.abs(targetx - entityManager._ships[gameplayManager.activePlayerNr].cx));
          if(Math.abs(targetx - entityManager._ships[gameplayManager.activePlayerIndex].cx) < 50){
            console.log("dont shoot");
            //move and rotate instead
            destX += startVelX;
            destX = util.clamp(destX);
            path = this.AIMovement(path);
            direction = this.AIrotation(direction);
            this.shipUpdate(destX, path, direction);
            //change direction and run movement
          } else {
            entityManager._ships[gameplayManager.activePlayerIndex].maybeFireBullet();
          }

        } else {
          destX += startVelX;
          destX = util.clamp(destX);
          path = this.AIMovement(path);
          direction = this.AIrotation(direction);
          this.shipUpdate(destX, path, direction);

    }
  },

  shipUpdate: function(destX, path, direction){

    //update all the variables in ship
    entityManager._ships[gameplayManager.activePlayerIndex].destX = destX;
    entityManager._ships[gameplayManager.activePlayerIndex].AIdirection = direction;
    entityManager._ships[gameplayManager.activePlayerIndex].AIpath = path;
  }


}




//===================================
