import WebpackLoader from 'phaser-webpack-loader';
import AssetManifest from '../AssetManifest';

/**
 * Preload the game and display the loading screen.
 */
export default class Preload extends Phaser.State {
  /**
   * Once loading is complete, switch to the main state.
   */
  create() {
    // Determine which postfix to use on the assets based on the DPI.
    let postfix = '';
    /*if (window.devicePixelRatio >= 3) {
      postfix = '@3x';
    } else if (window.devicePixelRatio > 1) {
      postfix = '@2x';
    }*/

    // Fix CORS issues with the loader and allow for unlimited parallel downloads.
    this.game.load.crossOrigin = 'anonymous';
    this.game.load.maxParallelDownloads = Infinity;

    this.game.physics.arcade.TILE_BIAS = 0;
    this.game.physics.arcade.OVERLAP_BIAS = 0;

    const maps = this.game.cache.getJSON('maps');
    maps.maps.forEach((map) => {
      this.load.tilemap(map.name, map.map, null, Phaser.Tilemap.TILED_JSON);
      this.load.image(map.name, map.tiles);
    });

    // Begin loading all of the assets.
    this.game.plugins.add(WebpackLoader, AssetManifest, postfix)
      .load()
      .then(() => {
        this.game.state.start('MainMenu');
      });
  }

  /**
   * Update the loading display with the progress.
   */
  update() {

  }
}
