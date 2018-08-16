export function createAsteroid(x: number, y: number, radius: number) {
  let asteroid = kontra.sprite({
    type: "asteroid",
    x: x,
    y: y,
    radius: radius,
    ttl: Infinity,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    render() {
      this.context.strokeStyle = "white";
      this.context.beginPath(); // start drawing a shape
      this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.context.stroke(); // outline the circle
    }
  });

  return asteroid;
}
