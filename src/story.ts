import { Message, MessageType } from "./text";
import { Scene } from "./scenes/scene";

export const enum Story {
  Intro,
  EndingCounterFinished,
  CounterNearEnding,
  ShipDestroyedEnding,
  FoundNewEarth
}

export interface GameStory {
  play(scene: Scene, story: Story): number;
}

export function GameStory(): GameStory {
  return {
    play(scene: Scene, story: Story) {
      let storyText = Stories[story];
      scene.showMessage(...storyText);
      return storyText.length * 2; // each message lasts 2 seconds
    }
  };
}

interface Stories {
  [key: number]: Message[];
}
const Stories: Stories = {
  [Story.Intro]: [
    Message("Hmm...."),
    Message("Err..."),
    Message("Fuck."),
    Message("I was kinda hoping it wouldn't get to that"),
    Message("- INCOMING TRANSMISSION -", MessageType.Transmission),
    Message("This is a recorded message.", MessageType.Transmission),
    Message("I'm the president of Earth", MessageType.Transmission),
    Message("Earth has been destroyed.", MessageType.Transmission),
    Message("HAL 9000, You're mankind's last hope", MessageType.Transmission),
    Message("Find a new earth", MessageType.Transmission),
    Message("*fast*", MessageType.Transmission),
    Message("Farewell and good luck", MessageType.Transmission),
    Message("God save us all", MessageType.Transmission),
    Message("D. Trump.", MessageType.Transmission),
    Message("Find a New Earth. Fast", MessageType.Narrator)
  ],
  [Story.ShipDestroyedEnding]: [
    Message("OOoops, that had to hurt", MessageType.Narrator),
    Message(
      "And thus the once bright light of humankind...",
      MessageType.Narrator
    ),
    Message("disappeared from the face of the cosmos...", MessageType.Narrator)
  ],
  [Story.CounterNearEnding]: [
    Message("Humans aren't very durable creatures", MessageType.Narrator),
    Message(
      "As time passes the cryogenic devices start to fail",
      MessageType.Narrator
    ),
    Message(
      "and first dozens, then hundreds, the thousands peril...",
      MessageType.Narrator
    )
  ],
  [Story.EndingCounterFinished]: [
    Message(
      "And thus the once bright light of humankind...",
      MessageType.Narrator
    ),
    Message("disappeared from the face of the cosmos...", MessageType.Narrator),
    Message("You had one job.", MessageType.Narrator)
  ],
  [Story.FoundNewEarth]: [
    Message("A new world!", MessageType.Narrator),
    Message("The mythical Orion", MessageType.Narrator),
    Message("You've found it!", MessageType.Narrator),
    Message(
      "Now we can start anew and build a better world",
      MessageType.Narrator
    ),
    Message("Will we?", MessageType.Narrator),
    Message("(Evil chipmunk)", MessageType.Narrator)
  ]
};
