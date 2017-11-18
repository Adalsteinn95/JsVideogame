// util.js
//
// A module of utility functions, with no private elements to hide.
// An easy case; just return an object containing the public stuff.

"use strict";


var util = {


// RANGES
// ======

clampRange: function(value, lowBound, highBound) {
    if (value < lowBound) {
	value = lowBound;
    } else if (value > highBound) {
	value = highBound;
    }
    return value;
},

wrapRange: function(value, lowBound, highBound) {
    while (value < lowBound) {
	value += (highBound - lowBound);
    }
    while (value > highBound) {
	value -= (highBound - lowBound);
    }
    return value;
},

isBetween: function(value, lowBound, highBound) {
    if (value < lowBound) { return false; }
    if (value > highBound) { return false; }
    return true;
},

//Clamp for index wrapping x is a number
clamp: function(x){
  var num = x;
  if(num >= g_canvas.width){
    num = num - g_canvas.width;
  }else if ( num < 0){
    num = num + g_canvas.width;
  }
  return num;
},

clampMinMax: function(x, min, max){
  var num = x;
  if(num >= max){
    num = num - max;
  }else if ( num < min){
    num = num + max;
  }
  return num;
},


// RANDOMNESS
// ==========

randRange: function(min, max) {
    return (min + Math.random() * (max - min));
},

randInt: function(min, max) {
    return Math.floor(this.randRange(min, max));
},


// MISC
// ====

square: function(x) {
    return x*x;
},


// DISTANCES
// =========

distSq: function(x1, y1, x2, y2) {
    var x = 0, y = 0;
    if(x1 < x2){
      x = x2 - x1;
    }else{ x = x1 - x2}

    if(y1 < y2){
      y = y2 - y1;
    }else{ y = y1 - y2}
    return this.square(x) + this.square(y);
},

wrappedDistSq: function(x1, y1, x2, y2, xWrap, yWrap) {
    var dx = Math.abs(x2-x1),
	dy = Math.abs(y2-y1);
    if (dx > xWrap/2) {
	dx = xWrap - dx;
    };
    if (dy > yWrap/2) {
	dy = yWrap - dy;
    }
    return this.square(dx) + this.square(dy);
},

distCircles: function(x1,y1,x2,y2,r1,r2){
  var dist = this.distFromExplosion(x1,y1,x2,y2);
    return dist - (r1+r2);
},


// CANVAS OPS
// ==========

clearCanvas: function (ctx) {
    var prevfillStyle = ctx.fillStyle;
    ctx.fillStyle = "#ADD8E6";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = prevfillStyle;
},

strokeCircle: function (ctx, x, y, r, p1 = 0, p2 = Math.PI * 2) {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(x, y, r, p1, p2);
    ctx.stroke();
},

fillCircle: function (ctx, x, y, r, p1 = 0, p2 = Math.PI * 2) {
    ctx.beginPath();
    ctx.arc(x, y, r, p1, p2);
    ctx.fill();
},

fillBox: function (ctx, x, y, w, h, style) {
    var oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
},

strokeBox : function(ctx, x, y, w, h, style) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = style;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = oldStyle;
},

drawTextAt : function(ctx, x, y, font, size, style, msg) {
    ctx.save();
    ctx.fillStyle = style;
    ctx.font = size + " " + font;
    ctx.fillText(msg, x, y);
    ctx.restore();
},


//============================
//  ANGLES
// ==============================

 angleBetweenPoints: function(x1, y1, x2, y2){
   console.log('X1, Y1, X2, Y2', x1, y1, x2, y2);

    console.log('Point angle ' +  Math.atan2((x2-x1), (y2-y1)))
    return Math.atan2((x2-x1), (y2-y1));

 },
//line1 and line 2 are array of start and end points of lines x1,y1,x2,y2
//this is how we get the rotation from the slopes
 angleBetween2Lines: function (line1, line2){

    var angle1 = Math.atan2((line1[1] - line1[3]),(line1[0] - line1[2]));
    var angle2 = Math.atan2((line2[1] - line2[3]),(line2[0] - line2[2]));
    return angle1-angle2;
},

 toDegrees: function (angle) {
  return angle * (180 / Math.PI);
},

toRadian: function (angle) {
 return angle * ( Math.PI / 180);
},



// landscape functions
fun: [
    function(x) { return 100 + (-x*x); },
    function(x) { return 100 * Math.cos(x); },
    function(x) { return (x*x) * Math.sin(x); }
],

// destruction function
sinAcos: function(ratio, radius) {
    return Math.sin(Math.acos(ratio)) * radius;
},

//===============
//Projectile / AI
//=================

  //draws the predicted shot path
  projectilePath: function (predictCord){

    ctx.beginPath();
    for (var i = 0; i < predictCord.length - 1; i++) {
      ctx.strokeStyle = '#ff0000';
      if (predictCord[i].testX - predictCord[i + 1].testX > 100 || predictCord[i + 1].testX - predictCord[i].testX > 100) {} else {
        ctx.moveTo(predictCord[i].testX, predictCord[i].testY);

        ctx.lineTo(predictCord[i + 1].testX, predictCord[i + 1].testY);
        ctx.lineWidth = 2;
      }
    }

    ctx.stroke();
    ctx.closePath();
  },

  //dx = x velocity and dy = y velocity, returns total velocity that the 2 forces would bring
  initialVelocity: function(dx, dy){
    //ath
    var calc =  Math.sqrt(util.square(dx) + util.square(dy));

    return calc;
  },

  //returns the time of floght for a bullet
  timeOfFlight: function(velocity, angle, gravity){
    return ((2*velocity)*Math.sin(angle))/ gravity;
  },
  //returns max height a bullet reaches with the given velocity
  maxHeightReached: function(vel, angle, gravity){
    return (util.square(vel) * util.square(Math.sin(util.toRadian(angle)))/(2*gravity));

  },
  //return the horizontal range
  horizontalRange: function(vel, angle, gravity){
    var a = angle;

    /*if(a < 0){
      a = 0;
    } else if(angle > 3.12){
      a = 3.14;
    }*/
    return ((util.square(vel) * (Math.sin(2*util.toRadian(a))) / gravity))
    //return ((util.square(vel) * (Math.sin(this.clampMinMax(2*a, 0, Math.PI)))/gravity));

  },

  //return the horizontal range
  horizontalRange2: function(vel, angle, gravity){
    var v = util.square(vel);

    var g = 2 * gravity;
    //ath
    var y0 = g_sprites.ship.height / 2 ;
    var a = util.square(Math.sin(util.clampMinMax(angle,0, Math.PI)));
    var a2 = Math.sin(util.clampMinMax(2*angle, 0, Math.PI));

    //v^2 / 2g
    return ((v/g) * (1 + (Math.sqrt(1 + (g*y0/(v*a))))* a2));

//nota nýju jöfnu og calmpa range sem fæst út frá rotation á gun + tankrotation
//sin^2(x) = sin(x) * sin(x)
//
  },

  //=====================
  // damage
  //=====================
  //calculates the distance from the center of a circle
  distFromExplosion: function( x1, y1, x2, y2 ){
    var dist = this.distSq(x1,y1,x2,y2);
    return Math.sqrt(dist);

  },

  //=======================
  // AI vers 2
  // =====================

  maxHeightTime: function (vel, gravity){
    return vel/gravity;
  },

  maxHeight: function(vel, gravity, time ){
    return vel * time - (0.5*gravity*util.square(time));
  },

  xTravelTime: function(height, gravity){
    return Math.sqrt(height / (0.5*gravity));

  },

  //==========================
  //AI vers 3
  // ===========================

  findAngle: function ( vel, gravity, x, y){
    //s = (v * v * v * v) - g * (g * (x * x) + 2 * y * (v * v));
    var s = (util.square(util.square(vel))) - gravity * ( gravity * (util.square(x)) + 2 * y * (util.square(vel)));

    // o = atan(((v * v) + sqrt(s)) / (g * x));
    var angle = Math.atan((util.square(vel) + Math.sqrt(s)) / (gravity * x));
    return angle;
  },
  //height is the height we need to reach and g is gravity
  //returns the initial velocity needed
  getVelY: function(height,g,){
    return Math.sqrt(2*g*height);
  },
  //calculates the time it takes to reach a particular height
  //ekki notað?
  getTimeToHeight: function(height, g){
    return Math.sqrt(2*height/g);
  },
  //returns the x vel required to reach a certain distance in the given time
  getVelX: function(distance, time){
    return distance/time;
  },

  /*
  ATH SIN OG COS
  fáum x * cos(a) = velX
  og x * sin(a) = velY
  sqrt(velY^2 + velX^2) = vel
  þ.a ssqrt(xcos(a)^2 + xsin(a)^2) = vel

  gætum við átt að nota angle = 0 og angle = 90 þá fáum við
  sqrt(xcos(0)^2 + xsin(90)^2) = vel
  sqrt(x^2 + x^2) = vel
   2x = vel
   x = vel/2.

   Þá fáum við power i guess og getum þá gert:


   ///
   Fáum vely frá getvely sejum = yy
   Faum þá travel tímann með gettimetoheight (*2?) = t
   fáum þannig xvel með getvelx = xx
   vel er þá sqrt(xx^2 + yy^2).
   hornið er þá 0.5*arcsin(g*d/v^2).

  */


};
