// I injected this in the index.html template
// directly to avoid 10K in prod package
// import "./styles.css";
import Game from "./game";

const game = Game.instance();
game.start();
