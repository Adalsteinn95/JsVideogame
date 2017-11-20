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

// returns integer in range: min to max-1
randInt: function(min, max) {
    return Math.floor(this.randRange(min, max));
},
/*function to get random wind,
  it is more likely that there will be litle wind
*/
randomWind: function() {
  var randomNum = Math.random();
  if(randomNum < 0.65) {
    return util.randRange(-0.05,0.05);

  }
  else if(randomNum < 0.9) {
    return util.randRange(-0.1,0.1);
  }
  else {
    return util.randRange(-0.2,0.2);
  }
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

renderGameOver: function(ctx, id) {
    var x = g_canvas.width/2;
    var y = g_canvas.height/2;
    var font = "Comic Sans MS";
    var size = "40px";
    var style = "black"
    var msg = (id === "nobody") ? "Tied game" : "The winner is player " + id + "!!!";
    ctx.textAlign = "center";
    console.log(x, y, font, style,msg);
    this.drawTextAt(ctx, x, y, font, size, style, msg);
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


  //=====================
  // damage
  //=====================
  //calculates the distance from the center of a circle
  distFromExplosion: function( x1, y1, x2, y2 ){
    var dist = this.distSq(x1,y1,x2,y2);
    return Math.sqrt(dist);

  },


  //==========================
  //AI
  // ===========================

  //ekki notað?
  _findAngle: function ( vel, gravity, x, y){
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
  //works only if ball is thrown directly up
  getTimeToHeight: function(vel, g){
  //  frá pat ekki efast um pat
   //return Math.sqrt(2*height/g);
   //þetta frekar?
   return (vel) /g

  },
  //get the time it takes to get down
  //notum svo tdown = (2dist / g); dist er þá frá max height í targety
  getTimeDown: function(dist, g){
    return Math.sqrt(2*dist / g);
  },
  //returns the x vel required to reach a certain distance in the given time
  getVelX: function(distance, time, wind){
    return (distance/time) - wind;
  },

  //finds the angle required to reach a certain distance given a velocity
   getAngle1: function(vel, dist, gravity ){
     //þarf að breyta í radiana ?
     var angle =  (0.5 * Math.asin((gravity*dist) / util.square(vel)))

     return angle;
   },

 //finds the angle required to reach a certain distance given a velocity
  getAngle2: function(vel, dist, gravity ){
    //þarf að breyta í radiana ?
    var angle =  util.toRadian(90) - (0.5 * Math.asin((gravity*dist) / util.square(vel)))

    return angle;
  },

  //   power = V^2 / 1- 3 cos(2a)
  getPower: function(vel, angle){

      return Math.sqrt(util.square(vel) / (1 - (3*Math.cos(2*angle))));
  },

  secondDegreeSolver: function(a,b,c){
    var result = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    var result2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    if ( result > 0){
      return result;
    } else return result2;

  },


//GLÓSUR NOTES
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

   búum til fall sem gískar á maxheight needed köllum það MHN
   var height = MHN();
   var distance = targetx - this.cx
   var velY = getVelY(height, gravity);
   var time = getTimeToHeight(height, gravity); // athuga þetta fall
   var velX = getVelX(distance, time);
   var vel = initialvelocity(velX, velY);
   var angel =  getAngle(vel, distance, gravity);

   Þá vitum við hvaða angle á að nota: og hvaða vel við viljum
   þ.a til að finna út hvaða power við viljum nota .......


    Við vitum þá DX og DY jafnan fyrir startvelx og y er :
    þar sem power er unknown
    sartvelx = (DX*launchvel) * power
    startvelY = DY*launchvel) * power   // afhverju gerðum við /2 ?

    vitum allt nema power þannig við fáum :
    power = startvelX / (DX*launcvel) og power = startvelY / (DY*launchvel);
    hmmm

         //angle of reach = a = 0.5 asin(g*d /v^2)
         --> sin(a/0.5) = g*d / v^2
         --> v^2 = g*d / sin(2a)
         --> v = sqrt(g*d / sin(2a));

         næsta skref mögulega --> VEL^2 = (x*sin(angle))^2 + (x*-cos(angle))^2

          hvað er power?
          vel_x = power * 4sin(angle);     5.97
          vel_Y = power/2 * -4cos(angle);   1.08

          þannig að
          gildin sem ég fæ: vel_x = 0.13, vel_Y = 1.5 , angle = 70;
          power = vel_x / 4sin(angle)  =  0.034   -- 1.59
          power = 2vel_Y / -4cos(angle) = 2.192   --  2.92

  */


   /*
      byrja á ða finna max height = s
      svo vel sem þarf y0 = sqrt(2*a*s)) þar sem a = gravity
      svo tímann til að ná hæstu hæð sem er tupp = y0 / g
      notum svo tdown = sqrt(2dist / g); dist er þá frá max height í targety
      t = tdown + tupp;
      svo þarf að margfalda til að fá Nominal time.
      distnace er targetx - this.cx
      x0 = distance/ t;
      vle er þá sqrt(x0^2 + y0^2);
      finnum svo angle:
      angle 1 = 0.5 * asin(g*d / v);  =21°
      angle 2 = util.toradian(90) - 0.5 * asin(g*d / v); = 69°
      power er þá : VEL = sqrt((power*4sin(angle))^2 + (((power/2)* -4cos(angle))^2);
      --> V^ 2 = (4Xsin(a)^2 - 2Xcos(a)^2)
      --> power = V^2 / 1- 3 cos(2a)

      erum með 2 angle sem við leitum á milli

   */

  //=====================
  // SOUNDstuff
  //=====================
  playSound : function(audio) {
    if(audio === g_audio.drive) {
      audio.volume = 0.2;
    }
    if(!g_mute) {
      audio.play();
    }

  },
  stopSound : function (audio) {
    audio.pause();
  },


  playSoundOverlap: function (sound) {
    var click=sound.cloneNode();
    this.playSound(click)
  },
  playTheme : function (sound) {
    if(!g_musicOn && !g_audio.theme.paused) {
      this.stopSound(g_audio.theme);

    }
    else if(g_musicOn && g_audio.theme.paused && toolbar.setupReady){
      g_audio.theme.volume = 0.2;
      this.playSound(g_audio.theme);
    }

  }

};
