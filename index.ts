import { registerRootComponent } from 'expo';

import Layout from './app/_layout';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
registerRootComponent(Layout);

