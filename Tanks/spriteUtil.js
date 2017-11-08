"use strict";

var spriteUtil = {

    loadSheet : function(celWidth, celHeight, numCols, numRows, numCells, img) {
        var arr = [];
        var sprite;

        for (var row = 0; row < numRows; ++row) {
            for (var col = 0; col < numCols; ++col) {
                sprite = new Sprite(img, col * celWidth, row * celHeight,
                                    celWidth, celHeight)
                arr.push(sprite);
            }
        }
        console.log(arr);
        return arr;
    }
}
