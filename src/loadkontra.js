import { kontra } from "./libs/kontra.min.js";
import RedShip from "./sprites/redship.png";
import { CanvasConfig } from "./canvas.config.js";

let canvas = window.document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

kontra.init();

// TODO: test this on lower resolution screens
// probably it isn't necessary to scale it for smaller screens
// to get that same pixelated look
kontra.context.scale(CanvasConfig.scale, CanvasConfig.scale);

// load assets
kontra.assets
  .load(RedShip)
  .then(function() {
    console.log("all assets loaded");
  })
  .catch(function(err) {
    console.log("error loading assets");
  });
