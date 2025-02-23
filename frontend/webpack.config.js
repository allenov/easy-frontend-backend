const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './public/app.js', // Укажите путь к основному файлу JavaScript
  output: {
    path: path.resolve(__dirname, 'public'), // Каталог для собранных файлов
    filename: 'bundle.js' // Имя собранного файла
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || 'http://localhost:5006')
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};