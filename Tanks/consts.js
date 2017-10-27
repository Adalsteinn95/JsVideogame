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
  var up = true;
  var a = 200;
  for(var i = 0; i< 600; i++){
    if(up){
    a += 1;
  } else { a -= 1}
    tmp.push(a);
    if(a=== 300 || a === 200){
      up = !up;
    }
  }
  console.log(tmp);
  return tmp;
}
