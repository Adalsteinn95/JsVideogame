// Multi-Image Preloader

"use strict";

/*jslint browser: true, devel: true, white: true */


/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// Extend the Image prototype (aka augment the "class")
// with my asyncLoad wrapper.
//
// I prefer this approach to setting onload/onerror/src directly.
//
Audio.prototype.asyncLoad = function(src, asyncCallback) {

    // Must assign the callback handlers before setting `this.src`,
    // for safety (and caching-tolerance).
    //
    // Uses the same handler for success *and* failure,
    // because they share a lot of the same logic.
    //
    // NB: The failure case can be identified by the "degenerate" nature
    // of the resulting "loaded" image e.g. test for this.width === 0
    //

    this.oncanplaythrough = asyncCallback;
    this.onerror = asyncCallback;

    // NB: The load operation can be triggered from any point
    // after setting `this.src`.
    //
    // It *may* happen immediately (on some browsers) if the image is already
    // in-cache, but will most likely happen some time later when the load has
    // occurred and the resulting event is processesd in the queue.

    this.src = src;
};


// imagePreload
//
// Horrible stuff to deal with the asynchronous nature of image-loading
// in the browser...
//
// It requires setting-up a bunch of handler callbacks and then waiting for them
// *all* to be exectued before finally triggering our own `completionCallback`.
//
// Makes use of "closures" to handle the necessary state-tracking between the
// intermediate callback handlers without resorting to global variables.
//
// IN  : `requiredAudio` - an object of <name:uri> pairs for each image
// OUT : `loadedAudio` - object to which our <name:Image> pairs will be added
// IN  : `completionCallback` - will be executed when everything is done
//
function audioPreload(requiredAudio,
                       loadedAudio,
                       completionCallback) {

    var numAudioRequired,
        numAudioHandled = 0,
        currentName,
        currentAudio,
        audioPreloadHandler;

    // Count our `requiredAudio` by using `Object.keys` to get all
    // "*OWN* enumerable properties" i.e. doesn't traverse the prototype chain
    numAudioRequired = Object.keys(requiredAudio).length;

    // A handler which will be called when our required images are finally
    // loaded (or when the fail to load).
    //
    // At the time of the call, `this` will point to an Image object,
    // whose `name` property will have been set appropriately.
    //
    audioPreloadHandler = function () {

        loadedAudio[this.name] = this;

        if (0 === this.width) {
            console.log("loading failed for", this.name);
        }

        // Allow this handler closure to eventually be GC'd (!)
        this.oncanplaythrough = null;
        this.onerror = null;

        numAudioHandled += 1;

        if (numAudioHandled === numAudioRequired) {

            completionCallback();

            console.log("completion callback done");
            console.log("");
        }
    };

    // The "for..in" construct "iterates over the enumerable properties
    // of an object, in arbitrary order."
    // -- unlike `Object.keys`, it traverses the prototype chain
    //
    for (currentName in requiredAudio) {

        // Skip inherited properties from the prototype chain,
        // just to be safe, although there shouldn't be any...

        // I prefer this approach, but JSLint doesn't like "continue" :-(
        //if (!requiredAudio.hasOwnProperty(currentName)) { continue; }

        if (requiredAudio.hasOwnProperty(currentName)) {

            currentAudio = new Audio();
            currentAudio.name = currentName;

            currentAudio.asyncLoad(requiredAudio[currentName], audioPreloadHandler);
        }
    }
}
