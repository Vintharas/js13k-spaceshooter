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
  - [*] ship energy indicator
  - [*] suns slowly recharge energy
  - when you get near to a sun you get more energy faster
- move
  - [*] move affects energy
  - [*] cant move if you dont have energy enough
  - [*] move around a map of fixed size? (more or less)
  - [*] don't render stuff that is not in the visible area
    - (is canvas smart enough to do this or do I need to take it into account?)
  - [*] add particles to moving (back and front)
  - show speed indicator?
  - tinker with the max speed
  - enabling pressing back to diminish forward speed (less strong than forward but same amount of energy)
  - iteratively generate map boundaries
- asteroids generation
  - [*] come from random location at random speed
  - [*] different size
  - [*] create clusters of asteroids
  - add new clusters every so often (outside of the current camera view)
- ship life/collisions
  - life and life indicator for the ship
  - collisions reduces life
  - collision decreases speed
  - asteroid breaks on collision (or disintegrates depending on size)
- shoot
  - shooting spends energy
  - shooting at asteroids releases components -> energy, life
  - makes asteroids smaller
  - energy moves towards the ship, when the ship is near
- stars
  - [*] testing sprites so far
  - [*] two different layers with different speeds and intensity
  - [*] moving as the camera moves
  - stars as tilesets or sprites?
    - sprites, very easy to create
      - perhaps harder to distribute at an "even" way around the ship
      - I think I have a working solution there
    - tiles, can create a parallax effect much easier
      - hmm I could make the camera movement affect more
        nearer background stuff as well, that should work
  - can I make stars with a tileset?
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
- enable/disable systems based on energy left
  - shield
  - radar
  - vision
  - shoot
  - thrust
  - life support?
- ways to lose
  - crushed by an asteroid
  - been too near a sun
  - black holes?
  - beasts and enemies attack you
  - too low energy? Life support disabled for a long period of time?
- smart enemies
  - reapers
  - galatic empire, etc
  - AIs
  - creatures
- a way to deliver story
- game engine

  - extract all variables so they're configurable from a single point
  - this could be altered by a UI in realtime and allow me to tweak the game

- Art
  - pixel art for everything
  - ship
    - particle systems for ship thrust
    - particle system for explosions/impacts
    - animate collisions
  - asteroids
    - test creating a texture procedurally
    - rotate as well as translate
  - planets
    - test generating a texture procedurally as well
    - idem
  - enemy ships, etc
- Music
  - ?
- Find a name for the game :D

## BUGS

- for some reason, a broken down asteroid doesn't collide with the ship, although it does collide with bullets. #wat
