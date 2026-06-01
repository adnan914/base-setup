const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, basename } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps', basename(__dirname)),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  externals: {
    bcrypt: 'commonjs bcrypt',
    'pg-native': 'commonjs pg-native',
    '@nestjs/microservices': 'commonjs @nestjs/microservices',
    '@nestjs/websockets/socket-module': 'commonjs @nestjs/websockets/socket-module',
    'class-transformer/storage': 'commonjs class-transformer/storage',
  },
  externalsPresets: { node: true },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
    }),
  ],
};
