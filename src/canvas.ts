import Config from "./config";
import { getValueInRange, Color } from "./utils";

// don't like this name
export default class OffscreenCanvas {
  private static offscreenCanvas: OffscreenCanvas;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private savedPatterns: Map<string, CanvasPattern> = new Map<
    string,
    CanvasPattern
  >();

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

  getPatternBasedOnColor(hue: number, saturation: number, light: number) {
    // memoize
    // TODO: extract to higher-order function
    if (this.savedPatterns.has(key(hue, saturation, light))) {
      return this.savedPatterns.get(key(hue, saturation, light));
    }

    // 1. define color theme
    const baseColor = (a: number) => Color.hsla(hue, saturation, light, a);
    const darkShade = (a: number) => Color.hsla(hue, saturation, light - 10, a);
    const lightShade = (a: number) =>
      Color.hsla(hue, saturation, light + 10, a);
    const colors = [baseColor, darkShade, lightShade];
    // 2. put colors in buckets with distributions (how much of color x)
    // 80% base color, 20% of the other ones

    // TODO: this is probably not working as I want it to be
    // the Math.random still gets the distribution at 1/3 per item
    // but at the end, there'll be only amount left of the biggest bucket
    // and that will be the one used. I need to tweak this!
    const buckets = [0.3, 0.3, 0.4];
    const weightedBuckets = buckets.map(w =>
      Math.floor(w * this.canvas.width * this.canvas.height)
    );
    // 3. distribute randomly pixel by pixel see how it looks
    for (let x = 0; x < this.canvas.width; x++) {
      for (let y = 0; y < this.canvas.height; y++) {
        let pickedColor = pickColor(colors, weightedBuckets);
        //console.log(pickedColor);
        this.context.fillStyle = pickedColor;
        this.context.fillRect(x, y, 1, 1);
      }
    }

    const pattern = this.context.createPattern(this.canvas, "repeat");
    this.savedPatterns.set(key(hue, saturation, light), pattern);
    return pattern;
    // TODO: (idea) I could play with alpha in the edges of a sprite to make
    // it have different shapes. That would mean painting the whole sprite
    // from scratch instead of using a pattern

    function pickColor(colors: ((a: number) => string)[], buckets: number[]) {
      //let alpha = getValueInRange(0.5, 1);
      let alpha = 1;

      if (buckets.some(n => n > 0)) {
        // color left in some bucket, pick color from bucket
        let pickedColor: string = "";
        while (pickedColor === "") {
          let index = Math.round(Math.random() * 2);
          if (buckets[index] > 0) {
            buckets[index]--;
            pickedColor = colors[index](alpha);
          }
        }
        return pickedColor;
      } else {
        // nothing left in buckets, then pick base color
        return colors[0](alpha);
      }
    }
  }
}

function key(hue: number, saturation: number, light: number) {
  return `${hue}/${saturation}/${light}`;
}
