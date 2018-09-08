// minimize overlapping files between two bundles
// kontra and game
export const CanvasConfig = {
  get canvasWidth() {
    return kontra.canvas.width / this.scale;
  },
  get canvasHeight() {
    return kontra.canvas.height / this.scale;
  },
  //scale: 1
  scale: 1.5
};
