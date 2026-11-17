const webpack = require('webpack')

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    files: [
      'src/tests/**/*.spec.jsx'
    ],
    preprocessors: {
      'src/tests/**/*.spec.jsx': ['webpack']
    },
    webpack: { 
      mode: 'development',
      plugins: [
        new webpack.DefinePlugin({
          'import.meta.env.BASE_URL': JSON.stringify('/')
        })
      ],
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: 'babel-loader'
          },
          {
            test: /\.(png|jpe?g)$/,
            type: 'asset/resource'
          },
          {
            test: /\.m?js$/,
            resolve: { fullySpecified: false }
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      }
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'text-summary' },
        { type: 'html' },
        { type: 'lcovonly' }
      ]
    },
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true,
    autoWatch: false,
    client: {
      jasmine: {
        random: false
      }
    },
    restartOnFileChange: false
  })
}
