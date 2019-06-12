const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Add support for Phaser webpack build.
const phaserModule = path.join(__dirname, '../node_modules/phaser-ce/dist/');
const phaser = path.join(phaserModule, 'phaser.js');
const pixi = path.join(phaserModule, 'pixi.js');

// Determine if this is a production build or not.
const isProd = process.env.NODE_ENV === 'production';

const distAssets = path.resolve(__dirname, '../dist/assets')
const resPath = path.resolve(__dirname, '../resources');
const spritesPath = path.resolve(resPath, 'sprites');
const generatedSrcPath = path.resolve(__dirname, '../src/generated');

const playerSpritesPath = path.resolve(spritesPath, 'players');

const playerSpriteColors = fs.readdirSync(playerSpritesPath)
  .map(playerName =>
    fs.readdirSync(path.resolve(playerSpritesPath, playerName))
      .map(color =>
        new SpritesmithPlugin({
          src: {
            cwd: path.resolve(playerSpritesPath, playerName, color),
            glob: '*.png',
          },
          target: {
            image: path.resolve(distAssets, `${playerName}-${color}.png`),
            css: path.resolve(__dirname, '../src/spritesmith-generated/sprite.styl'),
          },
          spritesmithOptions: {
            algorithm: 'top-down',
            algorithmOpts: {sort: false},
          },
        }))
  );

// flatten magic
const playerSprites = [].concat.apply([], playerSpriteColors);

// generate Players.json
const players = {
  players: fs.readdirSync(playerSpritesPath)
    .map(playerName => {
      return {
        name: playerName,
        colors: fs.readdirSync(path.resolve(playerSpritesPath, playerName))
      }
    })
}
// This is executed only once? We wont regenerate the json if we add new sprites after npm run dev
if (!fs.existsSync(generatedSrcPath)) {
  fs.mkdirSync(generatedSrcPath);
}
const playersFileContents = `export default ${JSON.stringify(players)}`;
fs.writeFileSync(path.resolve(generatedSrcPath, "Players.js"), playersFileContents);

// Define the Webpack config.
const config = {
  devtool: isProd ? false : '#source-map',
  watch: !isProd,
  performance: {
    hints: false,
  },
  entry: {
    app: [
      './src/index.js',
    ],
    vendor: [
      'pixi',
      'phaser',
      'howler',
      'webfontloader',
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: '[name].js?[chunkhash]',
  },
  resolve: {
    alias: {
      phaser,
      pixi,
      assets: path.join(__dirname, '../src/assets'),
    },
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: /node_modules\/(?!phaser-webpack-loader)/,
        options: {
          objectAssign: 'Object.assign',
        },
      },
      {
        test: /pixi\.js/,
        use: ['expose-loader?PIXI'],
      },
      {
        test: /phaser\.js$/,
        use: ['expose-loader?Phaser'],
      },
      {
        test: /\.(png|jpg|gif|svg|pvr|pkm|json)$/,
        use: ['file-loader?name=assets/[name].[ext]?[hash]'],
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "./src/assets/fonts",
        to: "fonts"
      }
    ]),
    // Use hoisting.
    new webpack.optimize.ModuleConcatenationPlugin(),
    // Pass environment variables to bundle.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    // Extract vendor chunks for better caching.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    }),
    // Extract the CSS file.
    new ExtractTextPlugin('styles.css?[contenthash]'),
    // Generate output HTML.
    new HTMLPlugin({
      template: './src/index.template.html',
    }),
    ...fs.readdirSync(spritesPath)
      .filter(filename => filename.endsWith('-sprite'))
      .map(filename =>
        new SpritesmithPlugin({
          src: {
            cwd: path.resolve(spritesPath, filename ),
            glob: '*.png',
          },
          target: {
            image: path.resolve(distAssets, `${filename}.png`),
            css: path.resolve(__dirname, '../src/spritesmith-generated/sprite.styl'),
          },
          spritesmithOptions: {
            algorithm: 'top-down',
            algorithmOpts: {sort: false},
          },
        })
      ),
    ...playerSprites,
  ],
};

// Define production-only plugins.
if (isProd) {
  // Run the bundle through Uglify.
  config.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: true,
  }));
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true,
      warnings: false,
    },
  }));
}

// Define development-only plugins.
if (!isProd) {
  // Setup live-reloading in the browser with BrowserSync.
  config.plugins.push(new BrowserSyncPlugin({
    host: 'localhost',
    port: 7777,
    server: {
      baseDir: ['./', './dist'],
    },
  }));
}

module.exports = config;
