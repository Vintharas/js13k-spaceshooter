# JS13K SPACESHOOTER

- Start working on the game
  - TOPIC: OFFLINE
  - define story
    - firefly. smuggling/jobs. fun.
    - post apocaliptic story? Ai. melancholy.
  - goal of the game
    - survive in space before your energy runs out or you die
    - offline
      - as your energy drops your ship system's will go offline
      - systems
        - shield
        - radar
        - vision
        - shoot
        - thrust
        - solar slowly recharges your energy

## BUILD - minimize assets to 13K

- Optimize build
  - Kontra is included as an unminifed raw string :/
  - styles loader takes 10K minified
  - right not it seems I'm about ~8Kb only framework and stuff

## CORE GAME MECHANICS

    - ship energy
      * ship energy indicator
      - suns slowly recharge energy
        - get nearer to a sun more energy faster
    - move
      - move affects energy
      - move around a map of fixed size
      - iteratively generate map boundaries
    - asteroids generation
      - come from random location at random speed
      - different size
    - shoot
      - shooting at asteroids releases components -> energy
      - makes asteroids smaller
      - energy moves towards the ship, when the ship is near
    - planets
      - more resources
      - stars give you energy faster
    - shield
      - slowly drains energy (same speed as sun in lowest charge)
      - protects ship hull
    - radar
      - show interesting stuff (like a minimap)
    - vision
      - diminish range of vision (player sees less space, rest becomes darker)
    - smart enemies
      - reapers
      - galatic empire, etc
      - AIs
      - creatures
    - a way to deliver story

- Find a name for the game :D
