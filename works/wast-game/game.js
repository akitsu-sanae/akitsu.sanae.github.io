'use strict';

let game = null; // exported functions
let ram = null;  // game buffer

let context = null;

function draw_player(x, y) {
    context.fillStyle = "rgba(100, 100, 160, 200)";
    context.beginPath();
    context.arc(x, y, 30, 0, Math.PI * 2.0, false);
    context.fill();
    context.fillRect(x-7.5, y-40, 15, 80);
    context.fillRect(x-37.5, y-30, 15, 80);
    context.fillRect(x+22.5, y-30, 15, 80);
}

function draw_player_hp(hp) {
    context.font = "32px Arial";
    context.fillStyle = "rgba(100, 100, 2000, 200)";
    context.fillText("LIFE: " + hp, 10, 600, 640);
}

function draw_shot(x, y) {
    context.fillStyle = "rgba(100, 120, 200, 200)";
    context.beginPath();
    context.arc(x, y, 10, 0, Math.PI * 2.0, false);
    context.fill();
}

function draw_enemy(x, y) {
    context.fillStyle = "rgba(200, 150, 150, 200)";
    context.beginPath();
    context.arc(x, y, 40, 0, Math.PI * 2.0, false);
    context.fill();
}

function draw_bullet(x, y) {
    context.fillStyle = "rgba(200, 200, 120, 200)";
    context.beginPath();
    context.arc(x, y, 10.0, 0, Math.PI * 2.0, false);
    context.fill();
}

function draw_enemy_hp(hp) {
    context.fillStyle = "rgba(250, 150, 150, 200)";
    context.fillRect(0, 0, 640 * hp / 100, 16);
}

function draw_title_scene() {
    context.font = "48pt Arial";
    context.fillStyle = "rgba(200, 200, 200, 200)";
    context.fillText("press Z key to start!", 32, 320, 640);
    context.font = "15pt Arial";
    context.fillText("[How to play]", 240, 480, 640);
    context.fillText("Move: Cursor Key", 240, 480+48, 640);
    context.fillText("Shot: Z key", 240, 480+48+32, 640);
}

function draw_gameclear_scene() {
    context.font = "48pt Arial";
    context.fillStyle = "rgba(200, 200, 200, 200)";
    context.fillText("Game Clear", 120, 120, 640);
}

function draw_gameover_scene() {
    context.font = "48pt Arial";
    context.fillStyle = "rgba(200, 200, 200, 200)";
    context.fillText("Game Over", 120, 120, 640);
}

document.body.onload = function() {
    fetch("./game.wasm")
        .then(res => res.arrayBuffer())
        .then(buffer =>  WebAssembly.instantiate(
            buffer, {
                imports: {
                    draw_player: (x, y) => draw_player(x, y),
                    draw_player_hp: (hp) => draw_player_hp(hp),
                    draw_shot: (x, y) => draw_shot(x, y),
                    draw_enemy: (x, y) => draw_enemy(x, y),
                    draw_bullet: (x, y) => draw_bullet(x, y),
                    draw_enemy_hp: (hp) => draw_enemy_hp(hp),
                    draw_title_scene: () => draw_title_scene(),
                    draw_gameclear_scene: () => draw_gameclear_scene(),
                    draw_gameover_scene: () => draw_gameover_scene(),
                    sin: (angle) => Math.sin(angle),
                    cos: (angle) => Math.cos(angle),
                    atan2: (y, x) => Math.atan2(y, x),
                    console: (i) => console.log(i)
                }
            }
        ))
        .then(({module, instance}) => {
            let canvas = document.getElementById("screen");
            context = canvas.getContext('2d');
            context.globalAlpha = 0.7;
            context.globalCompositeOperation = "screen";

            new WebAssembly.Memory({initial: 1025});
            ram = new Uint8Array(instance.exports.ram.buffer);

            /*
             * ram[1870 + 0] ... left key
             * ram[1870 + 1] ... up key
             * ram[1870 + 2] ... right key
             * ram[1870 + 3] ... down key
             * ram[1870 + 4] ... z key
             */
            document.onkeydown = e => {
                switch (e.keyCode) {
                case 37: // left
                    ram[1870 + 0] = 1;
                    break;
                case 38: // up
                    ram[1870 + 1] = 1;
                    break;
                case 39: // right
                    ram[1870 + 2] = 1;
                    break;
                case 40: // down
                    ram[1870 + 3] = 1;
                    break;
                case 90: // z
                    ram[1870 + 4] = 1;
                    ram[1870 + 5] = 1;
                    break;
                }
            };

            document.onkeyup = e => {
                switch (e.keyCode) {
                case 37: // left
                    ram[1870] = 0;
                    break;
                case 38: // up
                    ram[1870 + 1] = 0;
                    break;
                case 39: // right
                    ram[1870 + 2] = 0;
                    break;
                case 40: // down
                    ram[1870 + 3] = 0;
                    break;
                case 90: // z
                    ram[1870 + 4] = 0;
                    ram[1870 + 5] = 0;
                    break;
                }
            };
            update(instance);
        });
}

function update(instance) {
    context.clearRect(0, 0, 640, 640);
    instance.exports.update();
    ram[1874] = 0; // z key
    requestAnimationFrame(() => update(instance));
}
