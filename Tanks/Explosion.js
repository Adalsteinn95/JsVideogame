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
        ctx, this.cx, this.cy, this.rotation, this.radius, this.radius);
}

Explosion.prototype.update = function(du) {
  var hitEntity = this.findHitEntity();
  if (hitEntity) {
      var canTakeHit = hitEntity.takeExplosionHit;
      if (canTakeHit) canTakeHit.call(hitEntity);
  };

    if (++this.index >= this.sprite.length) {
        return entityManager.KILL_ME_NOW;
    }

Explosion.prototype.getRadius = function(){
  console.log(g_weapon.damage)
  return g_weapon.damage;
}
}
