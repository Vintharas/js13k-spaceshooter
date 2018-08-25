import { kontra } from "./libs/kontra.min.js";
import RedShip from "./sprites/redship.png";

let canvas = window.document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

kontra.init();

// load assets
kontra.assets
  .load(RedShip)
  .then(function() {
    console.log("all assets loaded");
  })
  .catch(function(err) {
    console.log("error loading assets");
  });
