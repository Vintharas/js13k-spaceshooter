// I injected this in the index.html template
// directly to avoid 10K in prod package
// import "./styles.css";
import "../libs/kontra.min.js";
import Game from "./game";
import RedShip from "./sprites/redship.png";
import BlueShip from "./sprites/blueship.png";
import GreenShip from "./sprites/greenship.png";
import Config from "./config";

let canvas = window.document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

kontra.init();

// TODO: test this on lower resolution screens
// probably it isn't necessary to scale it for smaller screens
// to get that same pixelated look
kontra.context.scale(Config.scale, Config.scale);

// load assets
/*
kontra.assets
  .load(RedShip, BlueShip, GreenShip)
  .then(function() {
    console.log("all assets loaded");
  })
  .catch(function(err: any) {
    console.log("error loading assets");
  });
*/

let game = Game.instance();
game.assets.load(RedShip, BlueShip, GreenShip);
game.start();
