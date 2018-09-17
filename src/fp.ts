export function noop() {}

export function before(func: any, beforeFunc: any) {
  return function(...args: any[]) {
    beforeFunc.apply(this, args);
    func.apply(this, args);
  };
}

export function after(func: any, ...afterFuncs: any[]) {
  return function(...args: any[]) {
    func.apply(this, args);
    afterFuncs.forEach((f: any) => f.apply(this, args));
  };
}

export function callTimes<T>(n: number, func: (() => T)): T[] {
  return [...Array(n)].map(() => func());
}
