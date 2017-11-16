// A module of generic constants
"use strict";

var consts = {

    FULL_CIRCLE: Math.PI * 2,
    RADIANS_PER_DEGREE: Math.PI / 180.0,

    // ======
    // WEAPONS
    // ======

   weapons : [
       {
        damage: 50,
        name: "normal",
        cost: 1
      },

       {
        showerAmount : 7,
        damage: 50,
        name: "shower",
        cost: 2
      },

       {
        damage: 150,
        name: "atom",
        cost: 6
      },
       {
        damage: 20,
        name: "tracer",
        cost: 4
      },
       {
        volcanoAmount:15,
        damage:20,
        name: "volcano",
        cost: 3
      }
    ]
};
