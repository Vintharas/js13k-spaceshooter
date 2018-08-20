const Config = {
  canvasWidth: 600,
  canvasHeight: 600,

  // an object far from the camera
  // more than this constant will be recycled
  mapBoundary: 3000,

  collidableTypes: ["asteroid", "bullet", "ship"],

  // enable debug printouts
  debug: true,
  verbose: false,
  typesToLog: ["asteroid", "ship"]
};

export default Config;
