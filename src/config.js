import { Faction } from "./factions";
import { PlanetType } from "./planet";

const Config = {
  get canvasWidth() {
    return kontra.canvas.width / this.scale;
  },
  get canvasHeight() {
    return kontra.canvas.height / this.scale;
  },
  // TODO: test with different scales
  // double scale makes it look more pixelated :D
  // which I like
  scale: 1.5,

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
  logTheseProperties: s => ({
    type: s.type,
    x: s.x,
    y: s.y,
    ttl: s.ttl
  }),
  onlyLogInProximityToShip: true, // great for debugging collisions
  renderCollisionArea: true,
  debugRadar: true,

  // UI
  UI: {
    Bar: {
      Width: 100,
      Height: 5
    }
  },

  // Game Objects
  Ship: {
    Energy: 500,
    Life: 200,
    Shield: 300,
    EnergyCost: {
      Thrust: 1,
      Brake: 1,
      Shoot: 10,
      ShieldRecharge: 1
    },
    Radar: {
      Size: 100,
      Radius: 45,
      Range: 1000
    }
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
  },

  Factions: {
    [Faction.Red]: {
      Name: "Harkonnen",
      PlanetName: "",
      Planet: PlanetType.Red,
      Objective: "War & Conquest",
      Description: "House Harkonnen...",
      Emblem: ""
    },
    [Faction.Blue]: {
      Name: "Atreides",
      PlanetName: "",
      Planet: PlanetType.Paradise,
      Objective: "Freedom & Liberty",
      Description: "House Atreides...",
      Emblem: "blueemblem"
    },
    [Faction.Green]: {
      Name: "Corrino",
      Planet: PlanetType.Green,
      PlanetName: "",
      Objective: "Wealth & Power",
      Description: "House Corrino...",
      Emblem: ""
    }
  }
};

export default Config;
