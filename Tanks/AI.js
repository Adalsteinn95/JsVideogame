"use strict"




var ai = {


  runAi: function(){
    //fær inn öll gildi frá ships sem þarf og kallar svo á hin föllinn með þeim
    //þá þarf bara eitt kall í ships
    //implementa seinast
  },

  getTarget: function(targetx){
    var targetx = this.playerNr + 1;
    targetx %= entityManager._ships.length;
    //AI will not aim at a dead player
    //will get fixed once we have a winner screen
    while(entityManager._ships[targetx]._isDeadNow){
      targetx++
      targetx = util.clampMinMax(targetx, 0, entityManager._ships.length);
    }

    return entityManager._ships[targetx].cx
  },

  AiMovement: function(AIpath){
    /*movement of the AI */
    if(AIpath === 0){
      /*generate 1 from 50*/
      //var num = Math.floor(Math.random()*100) + 1;
      var num = 100;
      /*50-50 that it will be a minus*/
      num *= Math.floor(Math.random()*2) == 1 ? 1 : -1
      AIpath = num;

    } else if(AIpath < 0){

      entityManager._ships[gameplayManager.activePlayerNr].cx--;
      entityManager._ships[gameplayManager.activePlayerNr].cx = util.clampRange(entityManager._ships[gameplayManager.activePlayerNr].cx, 0, g_canvas.width);
      AIpath++;
    } else if(this.AIpath > 0){

      entityManager._ships[gameplayManager.activePlayerNr].cx++;
      entityManager._ships[gameplayManager.activePlayerNr].cx = util.clampRange(entityManager._ships[gameplayManager.activePlayerNr].cx, 0 , g_canvas.width);
      AIpath--;
    }

    //return cx;
  },

  AIrotation: function(AIdirection){

    console.log("ping");
    /*Rotation of the AI gun*/
    if (Math.floor(util.toDegrees(entityManager._ships[gameplayManager.activePlayerNr].gunrotation)) === 180) {
      AIdirection = "left";
    }

    if (Math.floor(util.toDegrees(entityManager._ships[gameplayManager.activePlayerNr].gunrotation)) === 0) {
      AIdirection = "right";
    }

    if (AIdirection === "left") {
      entityManager._ships[gameplayManager.activePlayerNr].gunrotation -= NOMINAL_ROTATE_RATE * 2;
    }

    if (AIdirection === "right") {
      entityManager._ships[gameplayManager.activePlayerNr].gunrotation += NOMINAL_ROTATE_RATE * 2;
    }

  },

  AIfire: function (destX, startVelX, timer){

    targetx = getTarget(this.playerNr +1);

    //if (this.playerId === "AI") {
    //  if (this.myTurn === true) {
        if (Math.floor(destX) < targetx && targetx - 20 < Math.floor(destX) || Math.floor(destX) < targetx && targetx + 20 < Math.floor(destX)) {
          //&& targetx - this.cx > 50 || this.cx - targetx > 50

          //console.log(Math.abs(targetx - entityManager._ships[gameplayManager.activePlayerNr].cx));
          if(Math.abs(targetx - entityManager._ships[gameplayManager.activePlayerNr].cx) < 50){
            console.log("dont shoot");
            //run movement x times
          } else {
            //move the tank
            this.AiMovement(0);
            entityManager._ships[gameplayManager.activePlayerNr].maybeFireBullet();
          }

        } else {
          console.log("ping");
          destX += startVelX;
          destX = util.clamp(destX);
          return( AIfire(destX,startVelX))

    }
  }


}




//===================================

  targetx = getTarget(this.playerNr +1);

  if (this.playerId === "AI") {
    if (this.myTurn === true) {
      if (Math.floor(destX) < targetx && targetx - 20 < Math.floor(destX) || Math.floor(destX) < targetx && targetx + 20 < Math.floor(destX)) {
        //&& targetx - this.cx > 50 || this.cx - targetx > 50

        console.log(Math.abs(targetx - this.cx));
        if(Math.abs(targetx - this.cx) < 50){
          console.log("dont shoot");
          //run movement x times
        } else {
          this.AIpath = 0;
          this.maybeFireBullet();
        }

      } else {
        console.log("ping");
        destX += startVel[0];
        destX = util.clamp(destX);

  }
}
