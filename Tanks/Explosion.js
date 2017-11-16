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
        ctx, this.cx , this.cy , this.rotation, this.radius, this.radius);

}

Explosion.prototype.update = function(du) {

    if (++this.index >= this.sprite.length) {
        return entityManager.KILL_ME_NOW;
    }

}
