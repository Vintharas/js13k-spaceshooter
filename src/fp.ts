/* A function that does nothing */
export function noop(): void {}

/* Call a function before another function */
export function before(func: any, beforeFunc: any) {
  return function(...args: any[]) {
    beforeFunc.apply(this, args);
    func.apply(this, args);
  };
}

/* Call a function after another function */
export function after(func: any, ...afterFuncs: any[]) {
  return function(...args: any[]) {
    func.apply(this, args);
    afterFuncs.forEach((f: any) => f.apply(this, args));
  };
}

/* Call a function n times and store the results in an array */
export function callTimes<T>(n: number, func: (() => T)): T[] {
  return [...Array(n)].map(() => func());
}
