"use strict";

function Death(descr) {
    this.setup(descr);

    this.sprite = g_sprites.tankDeath;
    this.index = 0;
    this.delay = 1;

}

var delay = 2
Death.prototype = new Entity();

Death.prototype.render = function(ctx) {
    console.log(this.sprite);
    var cell = this.sprite[this.index];
    console.log(cell);
    cell.drawClippedCentredAt(
        ctx, this.cx, this.cy, this.rotation, this.radius, this.radius);
}

Death.prototype.update = function(du) {

    if(this.delay % delay === 0){
      this.index++;
    }

    this.delay++;

    if (++this.index >= this.sprite.length) {
        return entityManager.KILL_ME_NOW;
    }

Death.prototype.getRadius = function(){
  return 1;
}
}
