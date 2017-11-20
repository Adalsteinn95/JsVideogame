"use strict";

var spriteUtil = {

    decomposeSheet : function(celWidth, celHeight, numCols, numRows, numCells, img,) {
        var arr = [];
        var sprite;

        for (var row = 0; row < numRows; ++row) {
            for (var col = 0; col < numCols; ++col) {
                if (arr.length <= numCells) {
                    sprite = new Sprite(img, col * celWidth, row * celHeight,
                        celWidth, celHeight)
                        arr.push(sprite);
                }
            }
        }
        return arr;
    },

    loadImgs: function(obj, url, type) {

        var flag = "flag"

        for (var i = 0; i < 16; i++) {
            var f = flag + i;
            obj[f] = url + f + type;
        }
        return obj;
    },

    pushImg : function(imgs) {
        var arr = [];
        var sprite;

        for (var i = 0; i < imgs.length ; ++i) {

            sprite = new Sprite(imgs[i])
            arr.push(sprite);
        }

        return arr;
    },
}
