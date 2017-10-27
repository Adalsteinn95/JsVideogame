var g_canvas = document.getElementById('gameCanvas');
var g_ctx = g_canvas.getContext('2d');


var g_landscape = [];

var fun = function(x) {
    return (x*x) * Math.sin(x);
}


function draw (ctx) {

    ctx.fillStyle = "blue";

    var i = 0;

    ctx.moveTo(g_landscape[0][0], g_landscape[0][1]);

    for (i in g_landscape) {
        ctx.lineTo(g_landscape[i][0], g_landscape[i][1]);
        console.log(g_landscape[i][0], g_landscape[i][1]);
    }
    ctx.fill();
}

function clear(ctx) {
    ctx.fillStyle = "black";

    ctx.clearRect(0,0,600,600);
}

function initlandScape(ls, f, bound, boundShift) {

    var x = -bound + boundShift;

    for (var i = 0; i < g_canvas.width; i++) {
        var y = f(x);
        y += 300;
        ls.push([i,y]);

        x += ((2*bound)/g_canvas.width);
    }

    ls.push([600,600]);
    ls.push([0,600]);

    return ls;
}

function bombLandscape(x, radius) {

    x = Math.floor(x);
    radius = Math.floor(radius);

    var diff = x - radius;

    var ratio = -1, step = 1/radius;

    for (var i = diff; i < 2*radius + diff; i++) {
        g_landscape[i][1] += (Math.sin(Math.acos(ratio)) * radius);
        ratio += step;
    }
    draw(g_ctx);
}

function test() {
    var s = document.getElementById('bomb').value;

    s = s.split(',');

    bombLandscape(parseInt(s[0]), parseInt(s[1]));

}

g_landscape = initlandScape(g_landscape, fun, 15, 0);
//draw(g_ctx);
