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
    var tmp = spatialManager._nextSpatialID;
    spatialManager._nextSpatialID++;
    return tmp;

},

register: function(entity) {
    //var pos = entity.getPos();
    var radius = entity.getRadius();

    var spatialID = entity.getSpatialID();

    // TODO: YOUR STUFF HERE!
    spatialManager._entities[spatialID] = entity;
    //spatialManager._entities.splice(spatialID,0,entity);

},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();

    // TODO: YOUR STUFF HERE!
    spatialManager._entities[spatialID] = false;
    //spatialManager._entities.splice(spatialID,1);

},

findEntityInRange: function(posX, posY, radius) {
//    console.log(this._entities);
    // TODO: YOUR STUFF HERE!
    var c1 = {xPos : posX , yPos : posY , radius : radius};

    for(var i = 1; i<spatialManager._entities.length; i++){
      //collison check
      var thing = spatialManager._entities[i];

      if(thing === false){
        continue;
      }
      var c2 = {xPos : thing.cx, yPos : thing.cy, radius : thing.getRadius()};

      if(spatialManager.collisioncheck(c1,c2)){
        return thing;
      }
    }
    return false;

},

//detects collision between 2 circles
//c1 and c2 must contain x and y coordinates and radius
 collisioncheck: function(c1, c2){
   var distance = util.wrappedDistSq(c1.xPos, c1.yPos, c2.xPos,c2.yPos, g_canvas.width, g_canvas.height);
   var limit = c1.radius + c2.radius;
   limit = util.square(limit);
   if(distance < limit){
     return true;
   } else {return false;}

},

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";

    for (var ID in this._entities) {


        var e = this._entities[ID];

        if(e !== false){
          if(e.offsetX){
            util.strokeCircle(ctx, e.cx - e.offsetX, e.cy - e.offsetY, e.getRadius());
          } else {
        util.strokeCircle(ctx, e.cx, e.cy, e.getRadius());
      }
    }
    }
    ctx.strokeStyle = oldStyle;
}

}
