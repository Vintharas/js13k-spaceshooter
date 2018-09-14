export let Draw = {
  drawCircle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth = 1,
    lineDashSegments: number[] = undefined
  ) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    if (lineDashSegments) context.setLineDash(lineDashSegments);
    context.beginPath(); // start drawing a shape
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke(); // outline the circle
  },
  fillCircle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    fillStyle: string | CanvasGradient | CanvasPattern,
    lineWidth = 1
  ) {
    context.fillStyle = fillStyle;
    context.lineWidth = lineWidth;
    context.beginPath(); // start drawing a shape
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill(); // outline the circle
  },
  drawLine(
    context: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeStyle: string | CanvasGradient | CanvasPattern = undefined
  ) {
    context.beginPath();
    if (strokeStyle) context.strokeStyle = strokeStyle;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  },
  fillText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fillStyle: string = "rgba(255,255,255,0.8)",
    font: string = "normal normal 14px monospace"
  ) {
    context.fillStyle = fillStyle;
    context.font = font;
    context.fillText(text, x, y);
  },
  fillRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fillStyle: string | CanvasGradient | CanvasPattern
  ) {
    context.fillStyle = fillStyle;
    context.fillRect(x, y, w, h);
  },
  strokeRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    strokeStyle: string | CanvasGradient | CanvasPattern
  ) {
    context.strokeStyle = strokeStyle;
    context.strokeRect(x, y, w, h);
  }
};
