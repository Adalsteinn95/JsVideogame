"use strict";

function Explosion(descr) {
    this.setup(descr);


      this.sprite = g_sprites.xplode;

    this.index = 0;
}

Explosion.prototype = new Entity();

Explosion.prototype.render = function(ctx) {
    var cell = this.sprite[this.index];

    cell.drawClippedCentredAt(
        ctx, this.cx + 500, this.cy + 500, this.rotation, this.radius, this.radius);
    
}

Explosion.prototype.update = function(du) {
/*  var hitEntity = this.findHitEntity();
  if (hitEntity) {
      var canTakeHit = hitEntity.takeExplosionHit( this.cx, this.cy);
      if (canTakeHit) canTakeHit.call(hitEntity);
  };
*/


    if (++this.index >= this.sprite.length) {
        return entityManager.KILL_ME_NOW;
    }

Explosion.prototype.getRadius = function(){
  return g_weapon.damage;
}
}
