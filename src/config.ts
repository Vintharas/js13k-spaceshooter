const Config = {
  canvasWidth: 600,
  canvasHeight: 600,

  // an object far from the camera
  // more than this constant will be recycled
  mapBoundary: 3000,

  // game objects
  maxAsteroidClusterSize: 10,
  initialNumberOfClusters: 10,

  // collisions
  collidableTypes: ["asteroid", "bullet", "ship"],

  // enable debug printouts
  debug: false,
  verbose: false,
  typesToLog: ["asteroid", "ship"],
  logTheseProperties: (s: any) => ({
    type: s.type,
    x: s.x,
    y: s.y,
    ttl: s.ttl
  }),
  onlyLogInProximityToShip: true, // great for debugging collisions
  renderCollisionArea: true
};

export default Config;
