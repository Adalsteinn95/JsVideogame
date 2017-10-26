``// consts.js
//
// A module of generic constants

"use strict";


var consts = {

    FULL_CIRCLE: Math.PI * 2,
    RADIANS_PER_DEGREE: Math.PI / 180.0,
    yArray : makeYarray()

};

//test function
function makeYarray(){
  var tmp = [];
  var a = 0;
  for(var i = 0; i< 600; i++){
    a++;
    tmp.push(a);
    if(a=== 90){
      a= 0;
    }
  }
  return tmp;
}
