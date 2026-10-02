// Learn more https://docs.expo.io/guides/customizing-metro
const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withTamagui } = require('@tamagui/metro-plugin');

const config = getDefaultConfig(__dirname);
const routerEntry = fs.realpathSync(require.resolve('expo-router/entry'));
const virtualStoreDir = path.resolve(path.dirname(routerEntry), '../../..');
if (path.relative(__dirname, virtualStoreDir).startsWith('..')) {
  config.watchFolders = [...config.watchFolders, virtualStoreDir];
}

module.exports = withTamagui(config);
