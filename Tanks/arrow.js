"use strict";

function Arrow(descr) {
    this.setup(descr);

    this.sprite = g_sprites.arrows;

    this.index = 0;
    this.dir = -1;
}

Arrow.prototype = new Entity();

Arrow.prototype.render = function(ctx) {
    this.rotation = -90;
    this.sprite.scale = 0.025;
    this.sprite.drawCentredAt(
        ctx, this.cx , this.cy , this.rotation );

};
Arrow.prototype.update = function() {
    this.cx = entityManager._ships[gameplayManager.activePlayerIndex].cx;
    this.cy = entityManager._ships[gameplayManager.activePlayerIndex].cy + this.index - 40;
    //-20 til 0
      if(this.index < -20 || this.index > 0){
        this.dir *= -1;
      }

      this.index += this.dir;

};
