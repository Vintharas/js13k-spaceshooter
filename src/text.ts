export interface FontOptions {
  size: number;
  family: string;
}

export default function createText(
  text: string,
  x: number,
  y: number,
  font: string = "24px serif",
  ttl: number = Infinity
) {
  return kontra.sprite({
    x,
    y,
    ttl,
    render() {
      this.context.fillStyle = "white";
      this.context.font = font;
      this.context.fillText(text, x, y);
    }
  });
}
