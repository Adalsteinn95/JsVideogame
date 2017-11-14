"use strict";

var spriteUtil = {

    decomposeSheet : function(celWidth, celHeight, numCols, numRows, numCells, img) {
        var arr = [];
        var sprite;

        for (var row = 0; row < numRows - 1; ++row) {
            for (var col = 0; col < numCols - 1; ++col) {
                if (arr.length <= numCells) {
                    sprite = new Sprite(img, col * celWidth, row * celHeight,
                        celWidth, celHeight)
                        arr.push(sprite);
                }
            }
        }

        return arr;
    },


    pushImgUrl : function(url, length) {
        var arr = [];
        var sprite;

        for (var i = 1; i < length + 1; ++i) {
            var img = url + "expl" + i + ".png";
            sprite = new Sprite(img)
            arr.push(sprite);
        }

        return arr;
    },

    pushImg : function(imgs) {
        var arr = [];
        var sprite;

        for (var i = 0; i < imgs.length ; ++i) {

            sprite = new Sprite(imgs[i])
            console.log(sprite);
            arr.push(sprite);
        }

        return arr;
    },
}
