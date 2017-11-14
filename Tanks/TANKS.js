"use strict";


var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");


// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.

    //þurfum líklegast ekki
}


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {

    processDiagnostics();
    terrain.render(ctx, g_landscape, g_canvas);
    entityManager.update(du);

    // Prevent perpetual firing and gun change!
    eatKey(Ship.prototype.KEY_FIRE);
    eatKey(Ship.prototype.KEY_NEXTGUN);
    eatKey(Ship.prototype.KEY_PREVGUN);
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_weapon = consts.weapons[0];
var g_wind = util.randRange(-0.1,0.1)

var g_renderSpatialDebug = true;


var KEY_MIXED   = keyCode('M');
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
//var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');

var KEY_K = keyCode('K');
var button = document.getElementById("weaponbutton");
button.addEventListener("click", function() {
  var e = document.getElementById("weaponSelect");

});

function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_GRAVITY)) g_useGravity = !g_useGravity;

}

// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING
var first = true;
function renderSimulation(ctx) {

    if (gameplayManager.setupReady) {
        terrain.render(ctx, g_landscape, g_canvas);
        entityManager.render(ctx);

        if (g_renderSpatialDebug) spatialManager.render(ctx);
    }

    else {
        gameplayManager.setup();
    }

    gameplayManager.render(ctx)
    toolbar.render(dash_ctx);
}



// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        ship   : "../myndir/tanks/green.png",
        cloud1  : "../cloudsimg/cloud1.PNG",
        cloud2  : "../cloudsimg/cloud2.PNG",
        cloud3  : "../cloudsimg/cloud3.PNG",
        leftDoor : "../myndir/doorLeft.png",
        rightDoor : "../myndir/doorRight.png",
        tankgun : "../myndir/guns/green.png",
        explosion : "../myndir/explosives/explosionsheet.png",

        tankDeath : "../myndir/tankexplode/tankDeath.png",
        flagtest : "../myndir/flags/sw.png",
        pointer : "../myndir/pointer/arrowSmall.png",
        atom : "../myndir/explosives/atomsheet.png"

    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};

function preloadDone() {
    g_sprites.ship  = new Sprite(g_images.ship);
    g_sprites.tankgun = new Sprite(g_images.tankgun);

    g_sprites.bullet = new Sprite(g_images.ship);
    g_sprites.bullet.scale = 0.25;
    g_sprites.cloud1 = new Sprite(g_images.cloud1);
    g_sprites.cloud2 = new Sprite(g_images.cloud2);
    g_sprites.cloud3 = new Sprite(g_images.cloud3);

    g_sprites.xplode = spriteUtil.decomposeSheet(100,100,9,9,81, g_images.explosion);
    g_sprites.tankDeath = spriteUtil.decomposeSheet(81,40,6,2,12, g_images.tankDeath);
    g_sprites.atom = spriteUtil.decomposeSheet(96, 96, 5, 3, 14, g_images.atom);
    g_sprites.arrows = new Sprite(g_images.pointer);
    g_sprites.flag = new Sprite(g_images.flagtest);


    entityManager.init();
    toolbar.init();

    main.init();
}

// Kick it off
requestPreloads();
