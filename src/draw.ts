export const Draw = {
  drawCircle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth = 1
  ) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.beginPath(); // start drawing a shape
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke(); // outline the circle
  },
  drawLine(
    context: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeStyle: string | CanvasGradient | CanvasPattern
  ) {
    context.beginPath();
    context.strokeStyle = strokeStyle;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }
};
