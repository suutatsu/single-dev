/**
 * config
 * 
 * サイト毎に指定する
 */
const srcDir = __dirname + '/src'
const config = {
  css: {
    propertySort: 'alphabetical',
    mqSort:       'desktop-first',
    outputStyle:  'expanded'
  }
}

/**
 * define, plugins
 */
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const FixStyleOnlyEntriesPlugin = require( 'webpack-fix-style-only-entries' )
const Webpack = require( 'webpack' )
const path = require( 'path' )
const glob = require( 'glob' )
let entries = {}

glob.sync( `${srcDir}/**/*`, {
  ignore: [
    `${srcDir}/**/_*`,
    `${srcDir}/**/!(*.*)`
  ],
  cwd: srcDir
}).map( function( file ){
  let name = path.basename( file, path.extname(file) )
  entries[name] = path.resolve( srcDir, file );
})

const mode = process.env.NODE_ENV || 'development'
const isProd =  mode === 'production'
const isDev = mode === 'development'

module.exports = () => (
  {
  mode: mode,
  entry: entries,
  devtool: isDev ? 'source-map' : false,
  output: {
    filename: 'js/[name].js',
    path: path.join(__dirname, 'dist')
  },
  devServer: {
    contentBase: __dirname,
    open: true,
  },
  resolve: {
    alias: {
      npms: process.cwd() + '/node_modules/',
      modules: process.cwd() + '/src/js/modules/',
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/, // 
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ]
            }
          }
        ]
      },
      {
        test: /.(jpg|png|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '../img/[name].[ext]',
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '', // これは一体何を指定すれば…
              // only enable hot in development
              hmr: isDev,
              // if hmr does not work, this is a forceful method.
              // reloadAll: true,
            },
          },
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              url: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('autoprefixer')({
                  grid: true
                }),
                require('css-declaration-sorter')({
                  order: config.css.propertySort
                }),
                require('postcss-sort-media-queries')({
                  sort: config.css.mqSort
                })
              ]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: config.css.outputStyle
              }
            }
          },
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new FixStyleOnlyEntriesPlugin()
  ]
})
