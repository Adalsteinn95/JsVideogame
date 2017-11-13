function Cloud(descr) {

    this.randomisePosition();
    this.randomiseScale();

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
    this.cy = util.randRange(50, 150)

};

Cloud.prototype.randomiseScale = function () {
  this.scale = util.randRange(.2,.4);

};



Cloud.prototype.update = function (du) {

    this.cx += (g_wind * 10) * du;

    this.wrapPosition();

    //spatialManager.register(this);

};

Cloud.prototype.render = function (ctx) {
    //var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;


    this.sprite.drawWrappedCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};
