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
  collidableTypes: ["asteroid", "bullet", "ship", "cell", "planet"],

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
  renderCollisionArea: true,

  // Game objects
  Ship: {
    Energy: 500,
    Life: 200,
    Shield: 300
  },

  Cell: {
    OuterRadius: 8,
    InnerRadius: 2,
    TTL: 240,
    Speed: 0.7,
    EnergyBoost: 20,
    LifeBoost: 10
  },

  Planet: {
    Resources: 3000
  }
};

export default Config;
