import { Position, getValueInRange, getIntegerInRange } from "../utils";
import { Planet, createPlanet } from "../planet";
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
  let sun = createSectorSun(position, cameraPosition);
  let planets = createPlanets(sun, scene, cameraPosition);
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

function createSectorSun(sectorPosition: Position, cameraPosition: Position) {
  let centerOfTheSector = {
    x: sectorPosition.x + SectorSize / 2,
    y: sectorPosition.y + SectorSize / 2
  };
  let sunSize = getValueInRange(125, 175);
  let sun = createSun({ ...centerOfTheSector }, sunSize, cameraPosition);
  return sun;
}

function createPlanets(sun: Sun, scene: Scene, cameraPosition: Position) {
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
