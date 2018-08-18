export interface FontOptions {
  size: number;
  family: string;
}

export default function createText(
  text: string,
  x: number,
  y: number,
  font: string = "24px serif"
) {
  return kontra.sprite({
    x,
    y,
    render() {
      this.context.fillStyle = "white";
      this.context.font = font;
      this.context.fillText(text, x, y);
    }
  });
}
