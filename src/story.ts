import { Message, MessageType } from "./text";
import { Scene } from "./scenes/scene";

export const enum Story {
  Intro,
  EndingCounterFinished,
  CounterNearEnding
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
    Message("D. Trump.", MessageType.Transmission)
  ],
  [Story.CounterNearEnding]: [
    Message("Humans aren't very durable creatures"),
    Message("As time passes the cryogenic devices start to fail"),
    Message("and first dozens, then hundreds, the thousands peril...")
  ],
  [Story.EndingCounterFinished]: [
    Message("And thus the once bright light of humankind..."),
    Message("disappeared from the face of the cosmos..."),
    Message("You had one job.")
  ]
};
