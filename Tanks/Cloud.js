function Cloud(descr) {

    this.randomisePosition();
    this.randomiseScale();
    this.randomiseVelocity();

    //set random cloud image
    var randSprite = Math.random();

    if(randSprite < .33) {
      this.sprite = g_sprites.cloud1
    }
    else if(randSprite < .66) {
      this.sprite = g_sprites.cloud2
    }
    else  {
      this.sprite = g_sprites.cloud3
    }
    this.scale  = this.scale  || 1;
};

Cloud.prototype = new Entity();

Cloud.prototype.randomisePosition = function () {

    this.cx = util.randRange(0, 600)
    this.cy = util.randRange(25, 150)

};

Cloud.prototype.randomiseScale = function () {
  this.scale = util.randRange(.2,.4);

};

Cloud.prototype.randomiseVelocity = function () {
    this.windspeed = g_wind;
    console.log('G_WIND', Math.abs(g_wind * 10))
    var windPerc = Math.abs(g_wind * 10)

    var sizeOffset;
    if(this.scale < .25) {
      sizeOffset = 0.075 * windPerc;
    }
    else if(this.scale < .3) {
      sizeOffset = 0.05 * windPerc;
    }
    else if(this.scale < .35) {
      sizeOffset = 0.025 * windPerc;
    }
    else if(this.scale <= .4) {
      sizeOffset = 0;
    }
    if(g_wind < 0) {
      sizeOffset = -sizeOffset;

    }
    this.velX = g_wind + sizeOffset;
}



Cloud.prototype.update = function (du) {
    //if g_wind has changed, update the velocity
    if(this.windspeed !== g_wind) {
      this.randomiseVelocity();

    }

    this.cx +=  (this.velX * 10) * du;

    this.wrapPosition();

};

Cloud.prototype.render = function (ctx) {
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;

    this.sprite.drawWrappedCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};
