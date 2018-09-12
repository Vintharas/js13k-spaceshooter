// I injected this in the index.html template
// directly to avoid 10K in prod package
// import "./styles.css";
import "../libs/kontra.min.js";
import Game from "./game";
//import RedShip from "./sprites/redship.png";
//import GreenShip from "./sprites/greenship.png";
import BlueShip from "./sprites/blueship.png";
import Config from "./config";

let canvas = window.document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

kontra.init();

// TODO: test this on lower resolution screens
// probably it isn't necessary to scale it for smaller screens
// to get that same ultra-pixelated look
kontra.context.scale(Config.scale, Config.scale);

let game = Game.instance();
game.assets.load(BlueShip);
game.start();
