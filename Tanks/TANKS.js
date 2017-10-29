"use strict";


var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

// ====================
// CREATE INITIAL SHIPS
// ====================

function createInitialShips() {

    entityManager.generateShip({
        cx : 200,
        cy : 200
    });

}

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

    entityManager.update(du);

    // Prevent perpetual firing!
    eatKey(Ship.prototype.KEY_FIRE);
}



// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_MIXED   = keyCode('M');;
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');

var KEY_K = keyCode('K');

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

function renderSimulation(ctx) {

    graphicsManager.render(ctx);
    entityManager.render(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);
}



// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        ship   : "https://notendur.hi.is/~pk/308G/images/ship.png",
        ship2  : "https://notendur.hi.is/~pk/308G/images/ship_2.png",
        rock   : "https://notendur.hi.is/~pk/308G/images/rock.png",
        cloud  : "../cloudsimg/cloud1.PNG"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};

function preloadDone() {

    g_sprites.ship  = new Sprite(g_images.ship);
    g_sprites.ship2 = new Sprite(g_images.ship2);
    //g_sprites.rock  = new Sprite(g_images.rock);

    g_sprites.bullet = new Sprite(g_images.ship);
    g_sprites.bullet.scale = 0.25;
    g_sprites.cloud = new Sprite(g_images.cloud);

    entityManager.init();
    createInitialShips();

    main.init();
}

// Kick it off
requestPreloads();
