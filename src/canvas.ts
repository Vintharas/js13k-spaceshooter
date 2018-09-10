import Config from "./config";
import { getValueInRange, Color, HSL, degreesToRadians } from "./utils";

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
    // if (Config.debug) console.log("initializing offscreen canvas");
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

  getPatternBasedOnColor(
    hue: number,
    saturation: number,
    light: number,
    width: number = 16,
    height: number = 16,
    pixelSize: number = 2
  ) {
    // memoize
    // TODO: extract to higher-order function
    if (this.savedPatterns.has(key(hue, saturation, light, width, height))) {
      return this.savedPatterns.get(key(hue, saturation, light, width, height));
    }

    this.canvas.width = width;
    this.canvas.height = height;

    // 1. define color theme
    let baseColor = (a: number) => Color.hsla(hue, saturation, light, a);
    let nearBaseColor = (a: number) =>
      Color.hsla(hue, saturation, light - 5, a);
    let darkShade = (a: number) => Color.hsla(hue, saturation, light - 10, a);
    let darkestShade = (a: number) =>
      Color.hsla(hue, saturation, light - 20, a);
    let lightShade = (a: number) => Color.hsla(hue, saturation, light + 10, a);
    let lightestShade = (a: number) =>
      Color.hsla(hue, saturation, light + 20, a);

    let colors = [baseColor, darkShade, lightShade];
    // 2. put colors in buckets with distributions (how much of color x)
    // 50% base color, 30% dark, 20% light:
    let innerBuckets = [
      baseColor,
      baseColor,
      baseColor,
      baseColor,
      baseColor,
      nearBaseColor,
      nearBaseColor,
      nearBaseColor,
      lightShade,
      darkShade
    ];
    let outerBuckets = [
      baseColor,
      baseColor,
      baseColor,
      darkShade,
      lightShade,
      darkShade,
      darkShade,
      darkestShade,
      lightShade,
      lightestShade
    ];

    // 3. distribute randomly pixel by pixel see how it looks
    let activeBuckets = outerBuckets;
    for (let x = 0; x < this.canvas.width; x += pixelSize) {
      for (let y = 0; y < this.canvas.height; y += pixelSize) {
        if (
          x >= this.canvas.width / 4 &&
          x <= (this.canvas.width * 3) / 4 &&
          y >= this.canvas.height / 4 &&
          y <= (this.canvas.height * 3) / 4
        )
          activeBuckets = innerBuckets;
        else activeBuckets = outerBuckets;

        let pickedColor = pickColor(activeBuckets);
        //console.log(pickedColor);
        this.context.fillStyle = pickedColor;
        this.context.fillRect(x, y, pixelSize, pixelSize);
      }
    }

    let pattern = this.context.createPattern(this.canvas, "repeat");
    this.savedPatterns.set(key(hue, saturation, light, width, height), pattern);
    return pattern;

    // TODO: (idea) I could play with alpha in the edges of a sprite to make
    // it have different shapes. That would mean painting the whole sprite
    // from scratch instead of using a pattern
    // Also it would be interestin with different distributions in outer/inner
    // parts. That would result in landmasses? for instance
  }

  getPatternWithTransparency(
    color: HSL,
    width: number = 16,
    height: number = 16,
    pixelSize: number = 2
  ) {
    // memoize
    // TODO: extract to higher-order function
    let key = tkey(color.h, color.s, color.l, width, height);
    if (this.savedPatterns.has(key)) {
      return this.savedPatterns.get(key);
    }
    this.canvas.width = width;
    this.canvas.height = height;

    let baseColor = (a: number) => Color.hsla(color.h, color.s, color.l, a);
    for (let x = 0; x < this.canvas.width; x += pixelSize) {
      for (let y = 0; y <= this.canvas.height; y += pixelSize) {
        let pickedColor = baseColor(
          parseFloat(getValueInRange(0, 0.5).toFixed(2))
        );
        this.context.fillStyle = pickedColor;
        this.context.fillRect(x, y, pixelSize, pixelSize);
      }
    }

    this.context.rotate(degreesToRadians(30));
    let pattern = this.context.createPattern(this.canvas, "repeat");
    this.savedPatterns.set(key, pattern);

    return pattern;
  }

  getPatternBasedOnColors(
    primary: HSL,
    secondary: HSL,
    width: number = 16,
    height: number = 16,
    pixelSize: number = 2
  ) {
    // memoize
    // TODO: extract to higher-order function
    if (
      this.savedPatterns.has(twocolorkey(primary, secondary, width, height))
    ) {
      return this.savedPatterns.get(
        twocolorkey(primary, secondary, width, height)
      );
    }

    this.canvas.width = width;
    this.canvas.height = height;

    // 1. define color theme
    let p = primary;
    let s = secondary;

    let baseColor = (a: number) => Color.hsla(p.h, p.s, p.l, a);
    let lightShade = (a: number) => Color.hsla(p.h, p.s, p.l + 10, a);
    let darkShade = (a: number) => Color.hsla(p.h, p.s, p.l - 10, a);
    let accent = (a: number) => Color.hsla(s.h, s.s, s.l, a);

    let buckets = [
      baseColor,
      baseColor,
      baseColor,
      baseColor,
      lightShade,
      lightShade,
      darkShade,
      darkShade,
      accent,
      accent
    ];

    // 3. distribute randomly pixel by pixel see how it looks
    for (let x = 0; x < this.canvas.width; x += pixelSize) {
      for (let y = 0; y < this.canvas.height; y += pixelSize) {
        let pickedColor = pickColor(buckets);
        this.context.fillStyle = pickedColor;
        this.context.fillRect(x, y, pixelSize, pixelSize);
      }
    }

    let pattern = this.context.createPattern(this.canvas, "repeat");
    this.savedPatterns.set(
      twocolorkey(primary, secondary, width, height),
      pattern
    );
    return pattern;
  }
}

function key(
  hue: number,
  saturation: number,
  light: number,
  width: number,
  height: number
) {
  return `${hue}/${saturation}/${light}/${width}/${height}`;
}
function tkey(
  hue: number,
  saturation: number,
  light: number,
  width: number,
  height: number
) {
  return `t/${key(hue, saturation, light, width, height)}`;
}

function twocolorkey(
  primary: HSL,
  secondary: HSL,
  width: number,
  height: number
) {
  let key1 = key(primary.h, primary.s, primary.l, width, height);
  let key2 = key(secondary.h, secondary.s, secondary.l, width, height);
  return `${key1}//${key2}`;
}

function pickColor(buckets: any) {
  let index = Math.round(getValueInRange(0, 9));
  let alpha = 1;
  return buckets[index](alpha);
}
