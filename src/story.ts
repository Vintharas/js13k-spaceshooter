import { Message, MessageType } from "./text";
import { Scene } from "./scenes/scene";

export interface GameStory {
  playIntro(scene: Scene): void;
}
export function GameStory(): GameStory {
  return {
    playIntro(scene: Scene) {
      scene.showMessage(
        Message("Hmm...."),
        Message("Err..."),
        Message("Fuck."),
        Message("I was kinda hoping it wouldn't get to that"),
        Message("- INCOMING TRANSMISSION -", MessageType.Transmission),
        Message("This is a recorded message.", MessageType.Transmission),
        Message("I'm the president of Earth", MessageType.Transmission),
        Message("Earth has been destroyed.", MessageType.Transmission),
        Message(
          "HAL 9000, You're mankind's last hope",
          MessageType.Transmission
        ),
        Message("Find a new earth", MessageType.Transmission),
        Message("*fast*", MessageType.Transmission),
        Message("Farewell and good luck", MessageType.Transmission),
        Message("God save us all", MessageType.Transmission),
        Message("D. Trump.", MessageType.Transmission)
      );
    }
  };
}
