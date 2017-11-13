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
    }
}
