/**
 * Setup and control button that stops/starts background music.
 */
export default class BackgroundMusicButton {

  constructor({x, y, game}) {
    const audio = game.audio.background;
    
    const onPressed = (button) => {
      if (audio.paused) {
        audio.play();
        button.setFrames(1, 1, 1, 1);
      } else {
        audio.pause();
        button.setFrames(0, 0, 0, 0);
      }
    };

    const frameIndex = audio.paused ? 0 : 1;
    game.add.button(x, y, 'sound-icon', onPressed, this, frameIndex, frameIndex, frameIndex, frameIndex);
  }
}