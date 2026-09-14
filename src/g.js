import Game from "./game.js"

var game = new Game();
game.initMeshes();

loop();

function loop(){
    requestAnimationFrame(loop);

    game.update();
}