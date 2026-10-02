import { withNativeFederation, fromPackageJson } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: "mfe-commerce",
  exposes: { './Routes': "./apps/mfe-commerce/src/app/remote-entry/entry.routes.ts" },
  shared: fromPackageJson({ singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' }),
});
