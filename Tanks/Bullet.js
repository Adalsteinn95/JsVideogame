// ======
// BULLET
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Bullet(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Make a noise when I am created (i.e. fired)
    //this.fireSound.play();

/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Bullet.prototype = new Entity();


// Initial, inheritable, default values
Bullet.prototype.rotation = 0;
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 1;
Bullet.prototype.velY = 1;


// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 1;

Bullet.prototype.update = function (du) {

    if(this.partOfShower) {
      this.velX += (this.showerIndex/100 );
    }

    if (this.lifeSpan === 0 || this.cy > g_canvas.height) {

      return entityManager.KILL_ME_NOW;
    }

    this.cx += this.velX;
    this.cy += this.velY;
    this.velX += g_wind;
    this.velY += NOMINAL_GRAVITY;

    this.rotation += 1 * du;
    this.rotation = util.wrapRange(this.rotation,
                                   0, consts.FULL_CIRCLE);

    this.wrapPosition();

    // Handle collisions for bullet against tank
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit();
        if (canTakeHit) canTakeHit.call(hitEntity);
        entityManager._terrain[0].bombLandscape(this.cx, this.weapon);
        this.checkForVolcano();
        this.lifeSpan = 0;
        return;
    };

    //terrain hit
    this.terrainHit(this.cx, this.cy);

};

Bullet.prototype.terrainHit = function(x, y){
    var xIndex = util.clamp(Math.floor(x));
    if(entityManager._terrain[0].g_landscape[xIndex] < y){

        this.checkForVolcano();

        //check if the radius of the explosion hits a tank
        var hitEntity = this.findExplosionHitEntity();
        if (hitEntity) {
            var canTakeHit = hitEntity.takeExplosionHit(this.cx, this.cy);
            if (canTakeHit) canTakeHit.call(hitEntity);
        };
        console.log("hey");
        entityManager._terrain[0].bombLandscape(x, this.weapon);
        this.lifeSpan = 0;
    }

};

//find hit entity with the explosion Range
Bullet.prototype.findExplosionHitEntity = function() {

  //get explosion parameters, mainly radius!!
  var pos = this.getPos();
  return spatialManager.findEntityInRange(
      pos.posX, pos.posY, this.weapon.damage
  );
}


Bullet.prototype.checkForVolcano = function() {
  if(this.weapon.name === "volcano" && this.volcanoMaster) {
    for (var i = -this.weapon.volcanoAmount/2; i < this.weapon.volcanoAmount/2; i++) {
      var randVelX = util.randRange(-2,2)
      var randVelY = util.randRange(-2,-4)

      entityManager.fireBullet(this.cx, this.cy, randVelX, randVelY, this.gunrotation,true,i,false, this.weapon);
    }
  }
};

Bullet.prototype.getRadius = function () {
    return 2;
};


Bullet.prototype.render = function (ctx) {
    if(this.cy < 0) {
      g_sprites.bulletArrow.scale = 0.025;
      g_sprites.bulletArrow.drawCentredAt(
        ctx, this.cx, 0 + (g_sprites.bulletArrow.height/2)*g_sprites.bulletArrow.scale, 90

      );
    }

    g_sprites.bullet.drawWrappedCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};
