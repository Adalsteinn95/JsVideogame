/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var spatialManager = {

// "PRIVATE" DATA

_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

_entities : [],

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

getNewSpatialID : function() {

    // TODO: YOUR STUFF HERE!
    this._nextSpatialID++;


},

register: function(entity) {
    var pos = entity.getPos();
    var spatialID = entity.getSpatialID();

    // TODO: YOUR STUFF HERE!
    this._entities.push(entity);

},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();

    // TODO: YOUR STUFF HERE!
    for (var i = 0; i < this._entities.length; i++) {
      if(this._entities[i].getSpatialID() === spatialID){
        this._entities.splice(i,1);
      }
    }

},

findEntityInRange: function(posX, posY, radius, entity) {

    var hit = false;
    // TODO: YOUR STUFF HERE!
    for (var i = 0; i < this._entities.length; i++) {
      var position = this._entities[i].getPos();
      var distance = util.distSq(posX,posY,position.posX,position.posY);
      if(Math.sqrt(distance) - this._entities[i].getRadius() - radius <= 0){
        if(entity.reset_cx === 200 && this._entities[i].velRot > 0 || this._entities[i].velRot < 0 ){

        } else {
          this._entities[i].takeBulletHit();
        }
        hit = true;
      }
    }

    return hit;
},

render: function(ctx) {

    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";

    for (var ID in this._entities) {
        var e = this._entities[ID];
        util.strokeCircle(ctx, e.getPos().posX, e.getPos().posY, e.getRadius());
    }
    ctx.strokeStyle = oldStyle;
}

}
