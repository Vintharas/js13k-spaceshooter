import { Position, getValueInRange, getIntegerInRange } from "../utils";
import { Planet, createPlanet, PlanetType } from "../planet";
import { Asteroid } from "../asteroid";
import { Sun, createSun } from "../sun";
import { generateName } from "../names";
import { Scene } from "../scenes/scene";
import Config from "../config";

export interface Sector extends Position {
  name: string;
  planets: Planet[];
  sun: Sun;
  bodies: Sprite[];

  asteroids?: Asteroid[];
}

let SectorSize = 10000;

export function Sector(
  scene: Scene,
  position: Position,
  cameraPosition: Position,
  name = generateName()
): Sector {
  let isSunSystem = name === "sun";
  let sun = createSectorSun(position, cameraPosition, name);
  let planets = createPlanets(sun, scene, cameraPosition, isSunSystem);
  return {
    // this position represents the
    // top-left corner of the sector
    x: position.x,
    y: position.y,
    name,

    sun,
    planets,

    bodies: [sun, ...planets]
  };
}

function createSectorSun(
  sectorPosition: Position,
  cameraPosition: Position,
  name: string
) {
  let centerOfTheSector = {
    x: sectorPosition.x + SectorSize / 2,
    y: sectorPosition.y + SectorSize / 2
  };
  let sunSize = getValueInRange(125, 175);
  let sun = createSun({ ...centerOfTheSector }, sunSize, cameraPosition, name);
  return sun;
}

function createPlanets(
  sun: Sun,
  scene: Scene,
  cameraPosition: Position,
  isSunSystem = false
) {
  if (isSunSystem) return createSunSystemPlanets(sun, scene, cameraPosition);

  let numberOfPlanets = getIntegerInRange(1, 5);
  let planets = [];
  let planetPosition: Position = { x: sun.x, y: sun.y };
  for (let i = 0; i < numberOfPlanets; i++) {
    let additiveOrbit = getValueInRange(500, 1000);
    planetPosition.x = planetPosition.x + additiveOrbit;
    let radius = getValueInRange(50, 100);
    let planet = createPlanet(
      sun,
      /* orbit */ planetPosition.x - sun.x,
      radius,
      cameraPosition,
      scene
    );
    planets.push(planet);
  }
  return planets;
}

interface PlanetData {
  orbit: number;
  radius: number;
  name: string;
  type: PlanetType;
}
function createSunSystemPlanets(
  sun: Sun,
  scene: Scene,
  cameraPosition: Position
) {
  let planets: PlanetData[] = [
    { orbit: 300, radius: 30, name: "mercury", type: PlanetType.Barren },
    { orbit: 500, radius: 70, name: "venus", type: PlanetType.Red },
    { orbit: 700, radius: 50, name: "*earth*", type: PlanetType.Paradise },
    { orbit: 900, radius: 40, name: "mars", type: PlanetType.Red },
    { orbit: 1500, radius: 150, name: "jupiter", type: PlanetType.Barren },
    { orbit: 2100, radius: 130, name: "saturn", type: PlanetType.Red },
    { orbit: 2700, radius: 110, name: "uranus", type: PlanetType.Blue },
    { orbit: 3500, radius: 110, name: "neptune", type: PlanetType.Blue }
  ];
  return planets.map(p =>
    createPlanet(sun, p.orbit, p.radius, cameraPosition, scene, {
      name: p.name,
      type: p.type
    })
  );
}
