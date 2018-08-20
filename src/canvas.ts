import Config from "./config";

export default class OffscreenCanvas {
  private static offscreenCanvas: OffscreenCanvas;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private constructor() {
    // initialize canvas
    if (Config.debug) console.log("initializing offscreen canvas");
    this.canvas = document.createElement("canvas");
    this.canvas.width = 16;
    this.canvas.height = 16;
    this.context = this.canvas.getContext("2d");
  }

  static instance(): OffscreenCanvas {
    if (this.offscreenCanvas == undefined)
      this.offscreenCanvas = new OffscreenCanvas();
    return this.offscreenCanvas;
  }

  getPattern() {
    // generate some pattern
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, 16, 8);
    this.context.fillStyle = "pink";
    this.context.fillRect(0, 8, 16, 8);
    return this.context.createPattern(this.canvas, "repeat");
  }
}
