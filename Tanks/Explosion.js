"use strict";

function Explosion(descr) {
    this.setup(descr);

    this.sprite = g_sprites.xplode;
    this.index = 0;
}

Explosion.prototype = new Entity();

Explosion.prototype.render = function(ctx) {
    var cell = this.sprite[index];

    console.log(cell);

    cell.drawClippedCentredAt(
        ctx, this,cx, this.cy, this.rotation, this.radius, this.radius);

    this.index++;
}
