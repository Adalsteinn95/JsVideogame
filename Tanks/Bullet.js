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

Bullet.prototype.life = 10;

Bullet.prototype.tankWeapon = g_weapon;

// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function (du) {

    if(this.partOfShower) {
      this.velX += (this.showerIndex/100 );
      //console.log('THIS.SHOWERINDEX', this.showerIndex)
    }
    //console.log(this)

    // TODO: YOUR STUFF HERE! --- Unregister and check for death
    //spatialManager.unregister(this);

    if (this.lifeSpan === 0) return entityManager.KILL_ME_NOW;

    this.cx += this.velX;
    this.cy += this.velY;
    this.velY += NOMINAL_GRAVITY;


    this.rotation += 1 * du;
    this.rotation = util.wrapRange(this.rotation,
                                   0, consts.FULL_CIRCLE);

    this.wrapPosition();

    // Handle collisions
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        console.log("this " + canTakeHit)
        if (canTakeHit) canTakeHit.call(hitEntity);
        terrain.bombLandscape(this.cx, g_weapon.damage/2);
        console.log("eh");
        this.lifeSpan = 0;
        return;
    };

    //terrain hit first edition
    this.terrainHit(this.cx, this.cy);

    //(Re-)Register
    //spatialManager.register(this);
};

Bullet.prototype.terrainHit = function(x, y){
    var xIndex = util.clamp(Math.floor(x));
    console.log("ping");
    if(g_landscape[xIndex] < y){
        this.checkForVolcano()
        terrain.bombLandscape(x, g_weapon.damage);
        this.lifeSpan = 0;
    }



};

Bullet.prototype.checkForVolcano = function() {
  if(g_weapon === weapons.volcano && this.volcanoMaster) {
    for (var i = -g_weapon.volcanoAmount/2; i < g_weapon.volcanoAmount/2; i++) {
      var randVelX = util.randRange(-2,2)
      var randVelY = util.randRange(-2,-4)
      console.log(randVelY)
      entityManager.fireBullet(this.cx, this.cy, randVelX, randVelY, this.gunrotation,true,i,false);
    }
  }
};

Bullet.prototype.getRadius = function () {
    return 1;
};

Bullet.prototype.takeBulletHit = function () {
    this.kill();

    // Make a noise when I am zapped by another bullet
    //this.zappedSound.play();
};

Bullet.prototype.checkForWeapon = function (weapon) {

}

Bullet.prototype.render = function (ctx) {

    g_sprites.bullet.drawWrappedCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};
