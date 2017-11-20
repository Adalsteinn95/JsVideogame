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
    //terrain.render(ctx, entityManager._terrain[0].g_landscape, g_canvas);
    entityManager.update(du);

    // Prevent perpetual firing and gun change!
    eatKey(Ship.prototype.KEY_FIRE);
    eatKey(Ship.prototype.KEY_NEXTGUN);
    eatKey(Ship.prototype.KEY_PREVGUN);
    eatKey(Ship.prototype.KEY_ENDTURN);
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_weapon = consts.weapons[0];
var g_wind = util.randRange(-0.1,0.1)
var g_countdown = {
  duration:30000 / NOMINAL_UPDATE_INTERVAL,
  stop: false,

}
var g_renderSpatialDebug = true;
var g_mute = false;
var g_musicOn = true;;


var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
//var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');

var KEY_K = keyCode('K');
var KEY_MUTE = keyCode('M');
var KEY_MUSIC = keyCode('N');

var button = document.getElementById("weaponbutton");

function processDiagnostics() {

    if (eatKey(KEY_GRAVITY)) g_useGravity = !g_useGravity;
    if(eatKey(KEY_MUTE)) g_mute = !g_mute;
    if(eatKey(KEY_MUSIC)){
      g_musicOn = !g_musicOn
      util.playTheme(g_audio.theme);
    }

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
        //terrain.render(ctx, entityManager._terrain[0].g_landscape, g_canvas);
        entityManager.render(ctx);

        //if (g_renderSpatialDebug) spatialManager.render(ctx);
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
var preloadCount = 0;

var g_images = {};
var g_audio = {};

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
        pointer : "../myndir/arrow.png",
        atom : "../myndir/explosives/atomsheet.png",
        bulletArrow: "../myndir/arrow.png",
        music : "../myndir/music.png",
        sound : "../myndir/sound.png",
        off : "../myndir/off.png"

    };

    requiredImages = spriteUtil.loadImgs(requiredImages, "../myndir/flags/", ".png");


    var requiredAudio = {
      fire : "../sound/fire.mp3",
      shotCollision : "../sound/shotcollision.mp3",
      atom : "../sound/atom.mp3",
      drive : "../sound/drive.mp3",
      theme : "../sound/theme.mp3",
    };

    imagesPreload(requiredImages, g_images, preloadDone);
    audioPreload(requiredAudio, g_audio, preloadDone);
}

var g_sprites = {};

function preloadDone() {
    preloadCount++;
    //if both images and audio are prealoaded, do all the stuff
    if(preloadCount === 2) {

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
    g_sprites.bulletArrow = new Sprite(g_images.bulletArrow);
    g_sprites.music = new Sprite(g_images.music);
    g_sprites.sound = new Sprite(g_images.sound);
    g_sprites.off = new Sprite(g_images.off);


    g_sprites.flags = [];

    for (var i = 0; i < 16; i++) {
        var flag = "flag" + i;
        g_sprites.flags[i] = new Sprite(g_images[flag]);
    }

    entityManager.init();
    toolbar.init();
    main.init();

    }
}

// Kick it off
requestPreloads();
