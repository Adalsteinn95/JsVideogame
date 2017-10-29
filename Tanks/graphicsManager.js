var cloudX = 0;
var cloudY = 100;

var graphicsManager = {

  render : function(ctx) {

    this.drawBackground(ctx, 200)
  },

  drawBackground : function (ctx,wind) {
    this.updateCloud(g_sprites.cloud, wind);

    g_sprites.cloud.drawWrappedCentredAt(ctx ,cloudX, cloudY, this.rotation);
  },

  updateCloud : function (cloud,wind) {
    cloudX += wind / 100;
  }
}
