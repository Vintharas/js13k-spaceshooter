import { kontra } from "./libs/kontra.min.js";
import RedShip from "./sprites/redship.png";

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
