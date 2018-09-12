import { doThisEvery } from "./Time";
import { after, noop } from "./fp";

export interface Counter extends Sprite {
  start(): void;
}
export function Counter(x: number, y: number, minutes: number): Counter {
  let seconds = minutes * 60;
  return kontra.sprite({
    seconds,
    x,
    y,
    ttl: Infinity,
    isStarted: false,
    start() {
      this.isStarted = true;
    },
    update: after(noop, decreaseCounterEverySecond()),
    render() {
      let minutes = Math.floor(this.seconds / 60);
      let seconds = this.seconds % 60;
      let text = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      this.context.fillStyle = "white";
      this.context.font = `normal normal 24px monospace`;
      this.context.fillText(text, x, y);
    }
  });
}

function decreaseCounterEverySecond() {
  // returns a function that
  // takes an item from a message queue and shows it
  return doThisEvery({
    condition() {
      return this.isStarted;
    },
    action(this: Counter) {
      this.seconds--;
    },
    t: 1
  });
}
