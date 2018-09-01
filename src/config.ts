import { Faction } from "./factions";
import { PlanetType } from "./planet";
import { CanvasConfig } from "./canvas.config";

const Config = {
  ...CanvasConfig,

  // an object far from the camera
  // more than this constant will be recycled
  // TODO: make this smaller, temporarily increasing for
  // debugging's sake
  mapBoundary: 10000,

  // game objects
  maxAsteroidClusterSize: 10,
  initialNumberOfClusters: 10,

  // collisions
  collidableTypes: [
    "asteroid",
    "bullet",
    "ship",
    "cell",
    "planet",
    "planet-sun"
  ],

  // enable debug printouts
  debug: false,
  verbose: false,
  typesToLog: ["asteroid", "ship"],
  logTheseProperties: (s: Sprite) => ({
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
      ShieldRecharge: 1,
      Vision: 1
    },
    Radar: {
      Size: 100,
      Radius: 45,
      Range: 1000
    },
    InitialPosition: {
      get x() {
        return Config.canvasWidth / 2;
      },
      get y() {
        return Config.canvasHeight / 2;
      }
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
  },
  Sector: {
    Size: 10000
  },
  Stars: {
    MaxNumber: 500
  }
};

export default Config;
