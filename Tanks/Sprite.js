// ============
// SPRITE STUFF
// ============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// Construct a "sprite" from the given `image`,
//
function Sprite(image, cx = 0, cy = 0, width = image.width, height = image.height) {
    this.image = image;
    this.cx = cx;
    this.cy = cy;
    this.width = width;
    this.height = height;
    this.scale = 1;
}

Sprite.prototype.drawAt = function (ctx, x, y) {
    ctx.drawImage(this.image,
                  x, y);
};

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, rotation) {

    if (rotation === undefined) rotation = 0;

    var w = this.width,
        h = this.height;


    ctx.save();
    ctx.translate(cx, cy);

    ctx.rotate((rotation * Math.PI/180));
    //console.log(rotation);

    ctx.scale(this.scale, this.scale);

    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    ctx.drawImage(this.image,
                  -w/2, -h/2);

    ctx.restore();
};

Sprite.prototype.drawClippedCentredAt = function (
    ctx, cx, cy, rotation, w = this.width, h = this.height) {

    if (rotation === undefined) rotation = 0;

    //var w = this.width, h = this.height;

    ctx.save();
    ctx.translate(-w/2, -h/2);


    //ctx.rotate((rotation * Math.PI/180));

    ctx.drawImage(this.image, this.cx, this.cy, w, h, cx, cy, w, h);

    ctx.restore();
};


Sprite.prototype.drawGunCentredAt = function (ctx, cx, cy, rotation) {

    if (rotation === undefined) rotation = 0;

    var w = this.width,
        h = this.height;


    ctx.save();
    ctx.translate(cx, cy);

    ctx.rotate((rotation * Math.PI/180));

    //console.log(rotation);
    ctx.translate(g_sprites.tankgun.width/2,0);

    ctx.scale(this.scale, this.scale);

    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    ctx.drawImage(this.image,
                  -w/2, -h/2);

    ctx.restore();
};

Sprite.prototype.drawWrappedCentredAt = function (ctx, cx, cy, rotation) {

    // Get "screen width"
    var sw = g_canvas.width;

    // Draw primary instance
    this.drawWrappedVerticalCentredAt(ctx, cx, cy, rotation);

    // Left and Right wraps
    this.drawWrappedVerticalCentredAt(ctx, cx - sw, cy, rotation);
    this.drawWrappedVerticalCentredAt(ctx, cx + sw, cy, rotation);
};

Sprite.prototype.drawWrappedVerticalCentredAt = function (ctx, cx, cy, rotation) {

    // Get "screen height"
    var sh = g_canvas.height;

    // Draw primary instance
    this.drawCentredAt(ctx, cx, cy, rotation);
};
