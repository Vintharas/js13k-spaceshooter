export interface Action {
  action: () => void;
  t: number;
  condition: () => boolean;
}

export function doThisEvery({ action, t, condition = () => true }: Action) {
  let dt = 0;
  return function() {
    if (condition.apply(this)) {
      dt += 1 / 60;
      if (dt > t) {
        dt = 0;
        action.apply(this);
      }
    }
  };
}
